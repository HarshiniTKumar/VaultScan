from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime
import io

SEVERITY_COLORS = {
    "Critical": colors.HexColor("#FF3D3D"),
    "High":     colors.HexColor("#FF7043"),
    "Medium":   colors.HexColor("#FFB300"),
    "Low":      colors.HexColor("#66BB6A"),
}

def generate_report(devices: list, ip_range: str) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )

    styles = getSampleStyleSheet()
    elements = []

    # ── HEADER ──
    title_style = ParagraphStyle(
        "Title",
        fontSize=20,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#0D1F2D"),
        alignment=TA_CENTER,
        spaceAfter=6
    )
    sub_style = ParagraphStyle(
        "Sub",
        fontSize=11,
        fontName="Helvetica",
        textColor=colors.HexColor("#4A7A90"),
        alignment=TA_CENTER,
        spaceAfter=4
    )
    label_style = ParagraphStyle(
        "Label",
        fontSize=10,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#0D1F2D"),
        spaceAfter=2
    )
    body_style = ParagraphStyle(
        "Body",
        fontSize=9,
        fontName="Helvetica",
        textColor=colors.HexColor("#333333"),
        spaceAfter=4
    )

    elements.append(Paragraph("CERT-In Advisory Format", sub_style))
    elements.append(Paragraph("VaultScan — VAPT Report", title_style))
    elements.append(Paragraph("Automated Vulnerability Assessment for CCTV & DVR Systems", sub_style))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#00E5FF")))
    elements.append(Spacer(1, 0.4*cm))

    # ── REPORT META ──
    now = datetime.now().strftime("%d %B %Y, %H:%M:%S")
    meta_data = [
        ["Report Generated", now],
        ["Target IP Range", ip_range],
        ["Total Devices Scanned", str(len(devices))],
        ["Tool", "VaultScan v1.0 — CacheStack"],
        ["Compliance Format", "BIS IS 13252 / CERT-In Advisory"],
    ]
    meta_table = Table(meta_data, colWidths=[5*cm, 11*cm])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#0D1F2D")),
        ("TEXTCOLOR",  (0, 0), (0, -1), colors.HexColor("#00E5FF")),
        ("TEXTCOLOR",  (1, 0), (1, -1), colors.HexColor("#333333")),
        ("FONTNAME",   (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME",   (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE",   (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (1, 0), (1, -1), [colors.HexColor("#F5F5F5"), colors.white]),
        ("GRID",       (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
        ("PADDING",    (0, 0), (-1, -1), 6),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 0.6*cm))

    # ── SUMMARY ──
    total_vulns = sum(len(d.get("vulnerabilities", [])) for d in devices)
    critical = sum(1 for d in devices for v in d.get("vulnerabilities", []) if v["severity"] == "Critical")
    high     = sum(1 for d in devices for v in d.get("vulnerabilities", []) if v["severity"] == "High")
    medium   = sum(1 for d in devices for v in d.get("vulnerabilities", []) if v["severity"] == "Medium")
    cred_vuln = sum(1 for d in devices if d.get("default_creds"))

    elements.append(Paragraph("Executive Summary", styles["Heading2"]))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CCCCCC")))
    elements.append(Spacer(1, 0.2*cm))

    summary_data = [
        ["Metric", "Count"],
        ["Total Devices Found", str(len(devices))],
        ["Total Vulnerabilities", str(total_vulns)],
        ["Critical CVEs", str(critical)],
        ["High CVEs", str(high)],
        ["Medium CVEs", str(medium)],
        ["Devices with Default Credentials", str(cred_vuln)],
    ]
    summary_table = Table(summary_data, colWidths=[10*cm, 6*cm])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0D1F2D")),
        ("TEXTCOLOR",  (0, 0), (-1, 0), colors.white),
        ("FONTNAME",   (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME",   (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE",   (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#F5F5F5"), colors.white]),
        ("GRID",       (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
        ("ALIGN",      (1, 0), (1, -1), "CENTER"),
        ("PADDING",    (0, 0), (-1, -1), 6),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 0.6*cm))

    # ── PER DEVICE ──
    elements.append(Paragraph("Device Findings", styles["Heading2"]))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CCCCCC")))
    elements.append(Spacer(1, 0.2*cm))

    for i, device in enumerate(devices, 1):
        elements.append(Paragraph(f"Device {i} — {device['ip']}", styles["Heading3"]))

        # Device info
        ports = ", ".join(str(p) for p in device.get("open_ports", []))
        info_data = [
            ["IP Address", device["ip"]],
            ["Status", device.get("status", "up").upper()],
            ["Open Ports", ports or "None"],
            ["Banner", device.get("banner", "").strip() or "N/A"],
        ]
        info_table = Table(info_data, colWidths=[4*cm, 12*cm])
        info_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#EEF6F9")),
            ("FONTNAME",   (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTNAME",   (1, 0), (1, -1), "Helvetica"),
            ("FONTSIZE",   (0, 0), (-1, -1), 9),
            ("GRID",       (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
            ("PADDING",    (0, 0), (-1, -1), 5),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 0.2*cm))

        # CVE Table
        vulns = device.get("vulnerabilities", [])
        if vulns:
            elements.append(Paragraph("CVE Findings:", label_style))
            cve_data = [["CVE ID", "Severity", "CVSS", "Description", "Remediation"]]
            for v in vulns:
                cve_data.append([
                    v["cve_id"],
                    v["severity"],
                    str(v["cvss_score"]),
                    Paragraph(v["description"], body_style),
                    Paragraph(v["fix"], body_style),
                ])
            cve_table = Table(cve_data, colWidths=[2.8*cm, 1.8*cm, 1.2*cm, 5.5*cm, 4.7*cm])
            cve_style = [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0D1F2D")),
                ("TEXTCOLOR",  (0, 0), (-1, 0), colors.white),
                ("FONTNAME",   (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE",   (0, 0), (-1, -1), 8),
                ("GRID",       (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
                ("VALIGN",     (0, 0), (-1, -1), "TOP"),
                ("PADDING",    (0, 0), (-1, -1), 5),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#F5F5F5"), colors.white]),
            ]
            for row_i, v in enumerate(vulns, 1):
                sev_color = SEVERITY_COLORS.get(v["severity"], colors.gray)
                cve_style.append(("TEXTCOLOR", (1, row_i), (1, row_i), sev_color))
                cve_style.append(("FONTNAME",  (1, row_i), (1, row_i), "Helvetica-Bold"))
            cve_table.setStyle(TableStyle(cve_style))
            elements.append(cve_table)
            elements.append(Spacer(1, 0.2*cm))
        else:
            elements.append(Paragraph("✓ No CVEs matched for this device.", body_style))

        # Default creds
        creds = device.get("default_creds", [])
        if creds:
            elements.append(Paragraph("⚠ Default Credentials Found:", label_style))
            cred_data = [["Method", "Port", "Username", "Password"]]
            for c in creds:
                cred_data.append([c["method"], str(c["port"]), c["username"], c["password"] or "(empty)"])
            cred_table = Table(cred_data, colWidths=[4*cm, 2*cm, 4*cm, 6*cm])
            cred_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#FF3D3D")),
                ("TEXTCOLOR",  (0, 0), (-1, 0), colors.white),
                ("FONTNAME",   (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE",   (0, 0), (-1, -1), 8),
                ("GRID",       (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
                ("PADDING",    (0, 0), (-1, -1), 5),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#FFF0F0"), colors.white]),
            ]))
            elements.append(cred_table)

        elements.append(Spacer(1, 0.5*cm))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#EEEEEE")))
        elements.append(Spacer(1, 0.3*cm))

    # ── FOOTER NOTE ──
    elements.append(Spacer(1, 0.4*cm))
    elements.append(Paragraph(
        "This report was auto-generated by VaultScan for BIS IS 13252 compliance. "
        "All findings should be verified by a qualified security professional before remediation.",
        body_style
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()