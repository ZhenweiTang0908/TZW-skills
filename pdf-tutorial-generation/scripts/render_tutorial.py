#!/usr/bin/env python3
"""Render a screenshot-led PDF tutorial from a validated JSON manifest."""

from __future__ import annotations

import argparse
import json
import sys
import tempfile
from pathlib import Path
from typing import Any

try:
    from PIL import Image, ImageDraw, ImageFont
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import mm
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.platypus import (
        HRFlowable,
        Image as RLImage,
        KeepTogether,
        Paragraph,
        SimpleDocTemplate,
        Spacer,
        Table,
        TableStyle,
    )
except ImportError as exc:
    print(
        "Missing dependency. Run with: uv run --with pillow --with reportlab "
        "python scripts/render_tutorial.py ...",
        file=sys.stderr,
    )
    raise SystemExit(2) from exc


RED = "#D92D20"
INK = "#17202A"
MUTED = "#667085"
TINT = "#FFF5F4"
LINE = "#E4E7EC"
DEFAULT_LABELS = {
    "de": {"condition": "Bedingung", "input": "Eingabe", "result": "Ergebnis", "note": "Hinweis", "branch": "Bedingung"},
    "en": {"condition": "Condition", "input": "Input", "result": "Result", "note": "Note", "branch": "Condition"},
    "zh": {"condition": "条件", "input": "输入", "result": "结果", "note": "提示", "branch": "条件"},
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("manifest", type=Path, help="UTF-8 JSON tutorial manifest")
    parser.add_argument("--output", type=Path, required=True, help="Destination PDF")
    parser.add_argument("--font", type=Path, help="Regular TTF/OTF font")
    parser.add_argument("--font-bold", type=Path, help="Bold TTF/OTF font")
    parser.add_argument("--keep-annotated", type=Path, help="Keep annotated PNG files here")
    return parser.parse_args()


def fail(message: str) -> None:
    raise ValueError(message)


def load_manifest(path: Path) -> dict[str, Any]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"Cannot read manifest {path}: {exc}")
    if not isinstance(data, dict):
        fail("Manifest root must be an object")
    if not isinstance(data.get("title"), str) or not data["title"].strip():
        fail("Manifest requires a non-empty title")
    sections = data.get("sections")
    if not isinstance(sections, list) or not sections:
        fail("Manifest requires a non-empty sections array")
    return data


def resolve_font(explicit: Path | None, bold: bool = False) -> Path | None:
    if explicit:
        if not explicit.is_file():
            fail(f"Font does not exist: {explicit}")
        return explicit
    candidates = [
        Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    ]
    return next((path for path in candidates if path.is_file()), None)


def register_fonts(regular: Path | None, bold: Path | None) -> tuple[str, str]:
    regular = resolve_font(regular, bold=False)
    bold = resolve_font(bold, bold=True)
    if regular:
        pdfmetrics.registerFont(TTFont("TutorialRegular", str(regular)))
        regular_name = "TutorialRegular"
    else:
        regular_name = "Helvetica"
    if bold:
        pdfmetrics.registerFont(TTFont("TutorialBold", str(bold)))
        bold_name = "TutorialBold"
    else:
        bold_name = "Helvetica-Bold"
    return regular_name, bold_name


def validate_and_collect(manifest: dict[str, Any], base: Path) -> list[tuple[dict[str, Any], Path]]:
    collected: list[tuple[dict[str, Any], Path]] = []
    seen: set[int] = set()
    previous = 0
    for section_index, section in enumerate(manifest["sections"], start=1):
        if not isinstance(section, dict) or not str(section.get("title", "")).strip():
            fail(f"Section {section_index} requires a title")
        screens = section.get("screens")
        if not isinstance(screens, list) or not screens:
            fail(f"Section {section_index} requires at least one screen")
        for screen_index, screen in enumerate(screens, start=1):
            context = f"section {section_index}, screen {screen_index}"
            if not isinstance(screen, dict) or not str(screen.get("title", "")).strip():
                fail(f"{context} requires a title")
            image_value = screen.get("image")
            if not isinstance(image_value, str) or not image_value:
                fail(f"{context} requires an image")
            image_path = Path(image_value)
            if not image_path.is_absolute():
                image_path = base / image_path
            if not image_path.is_file():
                fail(f"Image does not exist for {context}: {image_path}")
            steps = screen.get("steps")
            if not isinstance(steps, list) or not steps:
                fail(f"{context} requires at least one step")
            local_numbers: set[int] = set()
            for step in steps:
                if not isinstance(step, dict):
                    fail(f"Each step in {context} must be an object")
                number = step.get("number")
                if not isinstance(number, int) or number <= 0:
                    fail(f"Each step in {context} needs a positive integer number")
                if number in seen or number <= previous:
                    fail("Step numbers must be unique and strictly increasing")
                for field in ("title", "text"):
                    if not isinstance(step.get(field), str) or not step[field].strip():
                        fail(f"Step {number} requires non-empty {field}")
                seen.add(number)
                local_numbers.add(number)
                previous = number
            annotations = screen.get("annotations", [])
            if not isinstance(annotations, list):
                fail(f"Annotations in {context} must be an array")
            for annotation in annotations:
                if not isinstance(annotation, dict):
                    fail(f"Annotations in {context} must be objects")
                number = annotation.get("number")
                box = annotation.get("box")
                if number not in local_numbers:
                    fail(f"Annotation {number!r} in {context} has no matching local step")
                if not isinstance(box, list) or len(box) != 4 or not all(isinstance(value, (int, float)) for value in box):
                    fail(f"Annotation {number} in {context} requires a numeric four-value box")
                x, y, width, height = box
                if x < 0 or y < 0 or width <= 0 or height <= 0 or x + width > 1 or y + height > 1:
                    fail(f"Annotation {number} in {context} is outside normalized image bounds")
            collected.append((screen, image_path))
    return collected


def pillow_font(font_path: Path | None, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    resolved = resolve_font(font_path, bold=True)
    if resolved:
        return ImageFont.truetype(str(resolved), size=size)
    return ImageFont.load_default()


def annotate_image(source: Path, annotations: list[dict[str, Any]], destination: Path, font_path: Path | None) -> None:
    with Image.open(source) as opened:
        image = opened.convert("RGB")
    draw = ImageDraw.Draw(image)
    width, height = image.size
    stroke = max(3, round(min(width, height) * 0.005))
    badge_radius = max(14, round(min(width, height) * 0.022))
    font = pillow_font(font_path, max(14, round(badge_radius * 1.15)))
    for annotation in annotations:
        x, y, box_width, box_height = annotation["box"]
        left = round(x * width)
        top = round(y * height)
        right = round((x + box_width) * width)
        bottom = round((y + box_height) * height)
        draw.rounded_rectangle((left, top, right, bottom), radius=stroke * 2, outline=RED, width=stroke)
        center_x = min(max(left, badge_radius), width - badge_radius)
        center_y = min(max(top, badge_radius), height - badge_radius)
        draw.ellipse(
            (center_x - badge_radius, center_y - badge_radius, center_x + badge_radius, center_y + badge_radius),
            fill=RED,
        )
        number_text = str(annotation["number"])
        text_box = draw.textbbox((0, 0), number_text, font=font)
        text_width = text_box[2] - text_box[0]
        text_height = text_box[3] - text_box[1]
        draw.text(
            (center_x - text_width / 2, center_y - text_height / 2 - text_box[1]),
            number_text,
            fill="white",
            font=font,
        )
        label = str(annotation.get("label", "")).strip()
        if label:
            label_font = pillow_font(font_path, max(12, round(badge_radius * 0.85)))
            label_box = draw.textbbox((0, 0), label, font=label_font)
            label_width = label_box[2] - label_box[0]
            label_height = label_box[3] - label_box[1]
            label_left = min(center_x + badge_radius + stroke, width - label_width - 2 * stroke)
            label_top = max(stroke, center_y - label_height / 2 - stroke)
            draw.rounded_rectangle(
                (label_left, label_top, label_left + label_width + 2 * stroke, label_top + label_height + 2 * stroke),
                radius=stroke,
                fill="white",
                outline=RED,
                width=max(1, stroke // 2),
            )
            draw.text((label_left + stroke, label_top + stroke - label_box[1]), label, fill=RED, font=label_font)
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, format="PNG", optimize=True)


def escape(value: Any) -> str:
    return str(value).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def labels_for(manifest: dict[str, Any]) -> dict[str, str]:
    language = str(manifest.get("language", "de")).lower().split("-", 1)[0]
    labels = dict(DEFAULT_LABELS.get(language, DEFAULT_LABELS["en"]))
    overrides = manifest.get("labels", {})
    if overrides is None:
        overrides = {}
    elif not isinstance(overrides, dict):
        fail("Manifest labels must be an object")
    for key, value in overrides.items():
        if key in labels and isinstance(value, str) and value.strip():
            labels[key] = value.strip()
    return labels


def paragraph_text(step: dict[str, Any], labels: dict[str, str]) -> str:
    parts = [f"<b>{escape(step['title'])}</b>", escape(step["text"])]
    for field in ("condition", "input", "result", "note"):
        value = step.get(field)
        if isinstance(value, str) and value.strip():
            parts.append(f"<b>{escape(labels[field])}:</b> {escape(value)}")
    return "<br/>".join(parts)


def image_flowable(path: Path, max_width: float, max_height: float) -> RLImage:
    with Image.open(path) as image:
        width, height = image.size
    scale = min(max_width / width, max_height / height)
    return RLImage(str(path), width=width * scale, height=height * scale)


def step_table(
    step: dict[str, Any],
    number_style: ParagraphStyle,
    step_style: ParagraphStyle,
    width: float,
    labels: dict[str, str],
) -> Table:
    badge = Table([[Paragraph(str(step["number"]), number_style)]], colWidths=[8 * mm], rowHeights=[8 * mm])
    badge.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(RED)),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    table = Table(
        [[badge, Paragraph(paragraph_text(step, labels), step_style)]],
        colWidths=[12 * mm, width - 12 * mm],
        hAlign="LEFT",
    )
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor(LINE)),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (0, 0), 3 * mm),
        ("RIGHTPADDING", (0, 0), (0, 0), 1 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 3 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3 * mm),
        ("LEFTPADDING", (1, 0), (1, 0), 1 * mm),
        ("RIGHTPADDING", (1, 0), (1, 0), 3 * mm),
    ]))
    return table


def build_pdf(
    manifest: dict[str, Any],
    output: Path,
    annotated: dict[int, Path],
    regular_font: str,
    bold_font: str,
) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(output),
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=16 * mm,
        bottomMargin=16 * mm,
        title=manifest["title"],
        author="",
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "TutorialTitle", parent=styles["Title"], fontName=bold_font, fontSize=26, leading=31,
        textColor=colors.HexColor(INK), spaceAfter=5 * mm, alignment=0,
    )
    subtitle_style = ParagraphStyle(
        "TutorialSubtitle", parent=styles["Normal"], fontName=regular_font, fontSize=11.5, leading=16,
        textColor=colors.HexColor(MUTED), spaceAfter=7 * mm,
    )
    section_style = ParagraphStyle(
        "Section", parent=styles["Heading1"], fontName=bold_font, fontSize=18, leading=22,
        textColor=colors.HexColor(INK), spaceBefore=5 * mm, spaceAfter=2.5 * mm, keepWithNext=True,
    )
    screen_style = ParagraphStyle(
        "Screen", parent=styles["Heading2"], fontName=bold_font, fontSize=14, leading=18,
        textColor=colors.HexColor(INK), spaceBefore=4 * mm, spaceAfter=2.5 * mm, keepWithNext=True,
    )
    body_style = ParagraphStyle(
        "Body", parent=styles["BodyText"], fontName=regular_font, fontSize=10.5, leading=14.5,
        textColor=colors.HexColor(INK), spaceAfter=3 * mm,
    )
    section_intro_style = ParagraphStyle(
        "SectionIntro", parent=body_style, keepWithNext=True,
    )
    caption_style = ParagraphStyle(
        "Caption", parent=styles["BodyText"], fontName=regular_font, fontSize=8.5, leading=11,
        textColor=colors.HexColor(MUTED), alignment=TA_CENTER, spaceBefore=1.5 * mm, spaceAfter=2.5 * mm,
    )
    branch_style = ParagraphStyle(
        "Branch", parent=body_style, fontName=bold_font, textColor=colors.HexColor(RED),
        backColor=colors.HexColor(TINT), borderColor=colors.HexColor(RED), borderWidth=0.7,
        borderPadding=7, spaceBefore=1 * mm, spaceAfter=3 * mm, keepWithNext=True,
    )
    step_style = ParagraphStyle(
        "Step", parent=body_style, fontSize=10.5, leading=14.5, spaceAfter=0,
    )
    number_style = ParagraphStyle(
        "Number", parent=body_style, fontName=bold_font, fontSize=11, leading=15,
        textColor=colors.white, alignment=TA_CENTER,
    )

    story: list[Any] = [Paragraph(escape(manifest["title"]), title_style)]
    labels = labels_for(manifest)
    subtitle = str(manifest.get("subtitle", "")).strip()
    if subtitle:
        story.append(Paragraph(escape(subtitle), subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor(RED), spaceAfter=3 * mm))

    screen_counter = 0
    for section in manifest["sections"]:
        section_lead: list[Any] = [Paragraph(escape(section["title"]), section_style)]
        intro = str(section.get("intro", "")).strip()
        if intro:
            section_lead.append(Paragraph(escape(intro), section_intro_style))
        branch = str(section.get("branch", "")).strip()
        if branch:
            section_lead.append(Paragraph(f"{escape(labels['branch'])}: {escape(branch)}", branch_style))
        for screen_index, screen in enumerate(section["screens"]):
            screen_counter += 1
            screenshot = image_flowable(annotated[screen_counter], doc.width, 105 * mm)
            lead: list[Any] = [Paragraph(escape(screen["title"]), screen_style), screenshot]
            caption = str(screen.get("caption", "")).strip()
            if caption:
                lead.append(Paragraph(escape(caption), caption_style))
            else:
                lead.append(Spacer(1, 2.5 * mm))
            lead.append(step_table(screen["steps"][0], number_style, step_style, doc.width, labels))
            if screen_index == 0:
                story.append(KeepTogether(section_lead + lead))
            else:
                story.append(KeepTogether(lead))
            for step in screen["steps"][1:]:
                story.append(Spacer(1, 2 * mm))
                story.append(KeepTogether([step_table(step, number_style, step_style, doc.width, labels)]))
            story.append(Spacer(1, 3 * mm))

    footer_text = str(manifest.get("footer", "")).strip()

    def draw_footer(canvas: Any, document: Any) -> None:
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor(LINE))
        canvas.line(document.leftMargin, 10 * mm, A4[0] - document.rightMargin, 10 * mm)
        canvas.setFont(regular_font, 8)
        canvas.setFillColor(colors.HexColor(MUTED))
        if footer_text:
            canvas.drawString(document.leftMargin, 6.5 * mm, footer_text)
        canvas.drawRightString(A4[0] - document.rightMargin, 6.5 * mm, f"{canvas.getPageNumber()}")
        canvas.restoreState()

    doc.build(story, onFirstPage=draw_footer, onLaterPages=draw_footer)


def main() -> int:
    args = parse_args()
    manifest_path = args.manifest.resolve()
    try:
        manifest = load_manifest(manifest_path)
        screens = validate_and_collect(manifest, manifest_path.parent)
        regular_name, bold_name = register_fonts(args.font, args.font_bold)
        with tempfile.TemporaryDirectory(prefix="pdf-tutorial-") as temp_name:
            annotated_dir = args.keep_annotated.resolve() if args.keep_annotated else Path(temp_name)
            annotated: dict[int, Path] = {}
            for index, (screen, image_path) in enumerate(screens, start=1):
                destination = annotated_dir / f"screen-{index:03d}.png"
                annotate_image(image_path, screen.get("annotations", []), destination, args.font_bold)
                annotated[index] = destination
            build_pdf(manifest, args.output.resolve(), annotated, regular_name, bold_name)
    except ValueError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 2
    print(f"Created {args.output.resolve()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
