import io
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, KeepTogether
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from django.conf import settings


def generate_roadmap_pdf(roadmap, user):
    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle('T', parent=styles['Title'], fontSize=26,
        textColor=colors.HexColor('#6c63ff'), spaceAfter=4, fontName='Helvetica-Bold')
    meta_style = ParagraphStyle('M', parent=styles['Normal'], fontSize=11,
        textColor=colors.HexColor('#888888'), spaceAfter=4)
    week_style = ParagraphStyle('W', parent=styles['Heading1'], fontSize=17,
        textColor=colors.HexColor('#a855f7'), spaceBefore=24, spaceAfter=6,
        fontName='Helvetica-Bold')
    obj_style = ParagraphStyle('O', parent=styles['Normal'], fontSize=11,
        textColor=colors.HexColor('#555555'), spaceAfter=14, leftIndent=8)
    res_title_style = ParagraphStyle('RT', parent=styles['Normal'], fontSize=13,
        textColor=colors.HexColor('#1a1a2e'), fontName='Helvetica-Bold', spaceAfter=3)
    res_meta_style = ParagraphStyle('RM', parent=styles['Normal'], fontSize=10,
        textColor=colors.HexColor('#888888'), spaceAfter=3)
    res_desc_style = ParagraphStyle('RD', parent=styles['Normal'], fontSize=10,
        textColor=colors.HexColor('#555555'), spaceAfter=6)
    notes_label_style = ParagraphStyle('NL', parent=styles['Normal'], fontSize=11,
        textColor=colors.HexColor('#a855f7'), fontName='Helvetica-Bold', spaceAfter=3)
    notes_style = ParagraphStyle('N', parent=styles['Normal'], fontSize=10,
        textColor=colors.HexColor('#333333'), spaceAfter=8, leftIndent=12,
        borderPad=6, leading=16)
    no_notes_style = ParagraphStyle('NN', parent=styles['Normal'], fontSize=10,
        textColor=colors.HexColor('#bbbbbb'), spaceAfter=8, leftIndent=12,
        fontName='Helvetica-Oblique')

    type_icons = {'video': '▶', 'article': '📄', 'book': '📖', 'exercise': '💪'}
    type_colors = {'video': '#a855f7', 'article': '#0ea5e9', 'book': '#10b981', 'exercise': '#f59e0b'}

    story = []

    # Header
    story.append(Paragraph('⚡ LearnPath', title_style))
    story.append(Paragraph(f'Roadmap: <b>{roadmap.goal}</b>', meta_style))
    story.append(Paragraph(
        f'Student: {user.username} &nbsp;|&nbsp; Level: {roadmap.experience_level.title()} &nbsp;|&nbsp; '
        f'XP: {user.xp} &nbsp;|&nbsp; Streak: {user.streak} days 🔥',
        meta_style
    ))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#a855f7')))
    story.append(Spacer(1, 16))

    # Summary box
    all_resources = [r for w in roadmap.weeks.all() for r in w.resources.all()]
    completed = sum(1 for r in all_resources if r.is_completed)
    notes_count = sum(1 for r in all_resources if r.notes)
    total = len(all_resources)
    progress = round((completed / total * 100)) if total > 0 else 0

    story.append(Paragraph(
        f'📊 Progress: {completed}/{total} resources completed ({progress}%) &nbsp;|&nbsp; '
        f'📝 Notes added: {notes_count} resources',
        meta_style
    ))
    story.append(Spacer(1, 20))

    # Topics Overview
    if roadmap.topics_overview and len(roadmap.topics_overview) > 0:
        story.append(Paragraph('🗺️ Course Overview Map', week_style))
        story.append(Spacer(1, 10))
        for topic_obj in roadmap.topics_overview:
            topic = topic_obj.get('topic', 'Unknown Topic')
            subtopics = topic_obj.get('subtopics', [])
            story.append(Paragraph(f'<b>• {topic}</b>', res_title_style))
            if subtopics:
                subtopics_str = ', '.join(subtopics)
                story.append(Paragraph(f'&nbsp;&nbsp;&nbsp;&nbsp;↳ <font color="#666666">{subtopics_str}</font>', res_desc_style))
            story.append(Spacer(1, 6))
        story.append(Spacer(1, 16))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e5e7eb')))
        story.append(Spacer(1, 16))

    # Weeks
    for week in roadmap.weeks.all().order_by('week_number'):
        week_items = []

        week_items.append(Paragraph(
            f'Week {week.week_number}: {week.title}', week_style
        ))
        week_items.append(Paragraph(f'🎯 {week.objective}', obj_style))
        week_items.append(HRFlowable(width="100%", thickness=0.5,
            color=colors.HexColor('#e5e7eb')))
        week_items.append(Spacer(1, 10))

        for resource in week.resources.all():
            icon = type_icons.get(resource.resource_type, '📌')
            color = type_colors.get(resource.resource_type, '#6c63ff')
            status = '✅' if resource.is_completed else '⬜'
            difficulty = f' | Difficulty: {resource.difficulty_rating}/5' if resource.difficulty_rating else ''

            res_items = []
            res_items.append(Paragraph(
                f'{status} <font color="{color}">[{icon} {resource.resource_type.upper()}]</font>  {resource.title}',
                res_title_style
            ))
            if resource.description:
                res_items.append(Paragraph(resource.description, res_desc_style))
            res_items.append(Paragraph(
                f'Duration: {resource.duration or "N/A"}{difficulty}', res_meta_style
            ))

            # Notes section
            res_items.append(Paragraph('📝 My Notes:', notes_label_style))
            if resource.notes and resource.notes.strip():
                # Split notes into lines for better formatting
                note_lines = resource.notes.strip().split('\n')
                for line in note_lines:
                    if line.strip():
                        res_items.append(Paragraph(f'• {line.strip()}', notes_style))
            else:
                res_items.append(Paragraph('No notes added for this resource.', no_notes_style))

            res_items.append(Spacer(1, 8))
            res_items.append(HRFlowable(width="80%", thickness=0.3,
                color=colors.HexColor('#eeeeee'), hAlign='LEFT'))
            res_items.append(Spacer(1, 8))

            week_items.extend(res_items)

        story.append(KeepTogether(week_items[:6]))
        story.extend(week_items[6:])
        story.append(Spacer(1, 16))

    # Footer
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#a855f7')))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'Generated by LearnPath — AI Personalized Learning Platform',
        ParagraphStyle('F', parent=styles['Normal'], fontSize=9,
            textColor=colors.HexColor('#aaaaaa'), alignment=TA_CENTER)
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer