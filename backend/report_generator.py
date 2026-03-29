from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from datetime import datetime

styles = getSampleStyleSheet()

# ---- STYLES ----
title = ParagraphStyle(name="Title", fontSize=18, alignment=1, spaceAfter=10)
subtitle = ParagraphStyle(name="Subtitle", fontSize=10, alignment=1, textColor=colors.grey)

section = ParagraphStyle(
    name="Section",
    fontSize=12,
    spaceBefore=10,
    spaceAfter=6,
    textColor=colors.black
)

subsection = ParagraphStyle(
    name="SubSection",
    fontSize=11,
    spaceBefore=6,
    spaceAfter=3,
    textColor=colors.black
)

normal = ParagraphStyle(name="Normal", fontSize=10, leading=14)
small = ParagraphStyle(name="Small", fontSize=9, textColor=colors.grey)


# ---- HELPERS ----
def simplify(v):
    desc = str(v.get("description", "")).lower()
    if "remote code execution" in desc:
        return "Device can be remotely controlled by an attacker."
    elif "authentication bypass" in desc:
        return "Authentication can be bypassed, allowing unauthorized access."
    return "Security weakness identified."


def risk_score(vulns):
    score = 0
    for v in vulns:
        if v.get("severity") == "Critical":
            score += 3
        elif v.get("severity") == "High":
            score += 2
        else:
            score += 1
    return min(score, 10)


def risk_label(score):
    if score >= 7:
        return "CRITICAL"
    elif score >= 4:
        return "HIGH"
    else:
        return "LOW"


# ---- MAIN ----
def generate_report(ip_range, devices):
    doc = SimpleDocTemplate(
        "vaultscan_report.pdf",
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=30
    )

    elements = []

    # ================= COVER =================
    elements.append(Spacer(1, 120))
    elements.append(Paragraph("VaultScan", title))
    elements.append(Paragraph("Automated Vulnerability Assessment Report", subtitle))
    elements.append(Spacer(1, 20))
    elements.append(Paragraph(f"Target Network: {ip_range}", subtitle))
    elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%d %B %Y, %H:%M')}", subtitle))
    elements.append(Spacer(1, 200))
    elements.append(Paragraph("Confidential Document", small))

    elements.append(PageBreak())

    # ================= EXEC SUMMARY =================
    total_vulns = sum(len(d.get("vulnerabilities", [])) for d in devices)
    risky = sum(1 for d in devices if d.get("vulnerabilities"))

    elements.append(Paragraph("<b>1. Executive Summary</b>", section))

    summary = Table([
        ["Total Devices Scanned", len(devices)],
        ["Devices with Identified Risks", risky],
        ["Total Vulnerabilities", total_vulns],
    ], colWidths=[300, 120])

    summary.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("BACKGROUND", (0, 0), (-1, -1), colors.whitesmoke),
    ]))

    elements.append(summary)
    elements.append(Spacer(1, 15))

    # ================= DEVICE ANALYSIS =================
    elements.append(Paragraph("<b>2. Detailed Findings</b>", section))

    for d in devices:
        ip = d.get("ip", "Unknown")
        ports = d.get("open_ports") or []
        vulns = d.get("vulnerabilities") or []
        creds = d.get("default_creds") or []

        score = risk_score(vulns)
        label = risk_label(score)

        # Header line (clean, aligned)
        header = Table(
            [[
                Paragraph(f"<b>Device:</b> {ip}", normal),
                Paragraph(f"<b>Risk:</b> {label} &nbsp;&nbsp; <b>Score:</b> {score}/10", normal)
            ]],
            colWidths=[3.5 * inch, 2.5 * inch]
        )

        header.setStyle(TableStyle([
            ("LINEBELOW", (0, 0), (-1, 0), 1, colors.grey),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
        ]))

        elements.append(header)
        elements.append(Spacer(1, 6))

        elements.append(Paragraph(f"<b>Open Ports:</b> {', '.join(map(str, ports))}", normal))

        if vulns:
            elements.append(Paragraph("<b>Findings</b>", subsection))
            for v in vulns:
                elements.append(Paragraph(f"• {simplify(v)}", normal))
                elements.append(Paragraph(
                    f"<font color='grey'>Remediation: {v.get('fix', 'Apply updates')}</font>",
                    small
                ))
        else:
            elements.append(Paragraph("No significant vulnerabilities identified.", normal))

        if creds:
            elements.append(Paragraph(
                "Default or weak credentials detected. Immediate password change is recommended.",
                normal
            ))

        elements.append(Spacer(1, 10))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.grey))
        elements.append(Spacer(1, 10))

    # ================= RECOMMENDATIONS =================
    elements.append(Paragraph("<b>3. Recommendations</b>", section))

    elements.append(Paragraph("• Replace all default credentials with strong passwords", normal))
    elements.append(Paragraph("• Regularly update firmware and software", normal))
    elements.append(Paragraph("• Disable unnecessary services and ports", normal))
    elements.append(Paragraph("• Implement network segmentation", normal))
    elements.append(Paragraph("• Continuously monitor network activity", normal))

    elements.append(Spacer(1, 20))

    # ================= FOOTER =================
    elements.append(Paragraph(
        "This report is automatically generated by VaultScan. "
        "All findings should be validated before remediation.",
        small
    ))

    doc.build(elements)
    