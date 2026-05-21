from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import weasyprint
import io
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
@page {{
    size: A4;
    margin: 2.5cm 2cm 2.5cm 2.5cm;
    @bottom-center {{
        content: counter(page);
        font-family: "DejaVu Sans", sans-serif;
        font-size: 9pt;
        color: #64748b;
    }}
}}

body {{
    font-family: "DejaVu Sans", sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #1e293b;
}}

h1 {{
    font-family: "DejaVu Sans", sans-serif;
    font-size: 24pt;
    font-weight: 700;
    color: #0f172a;
    margin-top: 0;
    margin-bottom: 1.5em;
    letter-spacing: -0.02em;
    border-bottom: 2px solid #64748b;
    padding-bottom: 0.5em;
}}

h2 {{
    font-family: "DejaVu Sans", sans-serif;
    font-size: 18pt;
    font-weight: 700;
    color: #1e293b;
    margin-top: 1.5em;
    margin-bottom: 0.75em;
}}

h3 {{
    font-family: "DejaVu Sans", sans-serif;
    font-size: 14pt;
    font-weight: 600;
    color: #334155;
    margin-top: 1.2em;
    margin-bottom: 0.5em;
}}

p {{
    margin-bottom: 0.8em;
}}

strong {{
    font-weight: 700;
    color: #0f172a;
}}

code {{
    font-family: "DejaVu Sans Mono", monospace;
    font-size: 9.5pt;
    background: #f1f5f9;
    padding: 0.15em 0.4em;
    border-radius: 2px;
}}

pre {{
    background: #f1f5f9;
    padding: 1em;
    border-left: 3px solid #64748b;
    margin: 1em 0;
    font-size: 9pt;
    line-height: 1.5;
    overflow-x: auto;
}}

pre code {{
    background: transparent;
    padding: 0;
}}

blockquote {{
    border-left: 3px solid #d4a574;
    padding-left: 1em;
    margin: 1em 0;
    font-style: italic;
    color: #475569;
}}

li {{
    margin-bottom: 0.3em;
}}

a {{
    color: #64748b;
    text-decoration: underline;
}}
</style>
</head>
<body>
{content}
</body>
</html>"""

def md_to_html(md: str) -> str:
    html = md

    html = html.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    html = re.sub(r"^### (.+)$", r"<h3>\1</h3>", html, flags=re.MULTILINE)
    html = re.sub(r"^## (.+)$", r"<h2>\1</h2>", html, flags=re.MULTILINE)
    html = re.sub(r"^# (.+)$", r"<h1>\1</h1>", html, flags=re.MULTILINE)

    def code_block(match):
        code = match.group(1)
        return f"<pre><code>{code}</code></pre>"

    html = re.sub(r"```\\w*\\n(.*?)```", code_block, html, flags=re.DOTALL)

    html = re.sub(r"`([^`]+)`", r"<code>\1</code>", html)
    html = re.sub(r"\\*\\*(.+?)\\*\\*", r"<strong>\1</strong>", html)

    html = re.sub(r"^> (.+)$", r"<blockquote>\1</blockquote>", html, flags=re.MULTILINE)

    html = re.sub(r"^\\d+\\. (.+)$", r"<li>\1</li>", html, flags=re.MULTILINE)
    html = re.sub(r"^- (.+)$", r"<li>\1</li>", html, flags=re.MULTILINE)

    html = re.sub(r"\\n{2,}", "</p><p>", html)

    return html


class PdfRequest(BaseModel):
    markdown: str


@app.post("/api/generate-pdf")
async def generate_pdf(req: PdfRequest):
    content_html = md_to_html(req.markdown)
    full_html = HTML_TEMPLATE.format(content=content_html)

    pdf_bytes = weasyprint.HTML(string=full_html).write_pdf()

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=oilbird-document.pdf"},
    )


@app.get("/api/health")
async def health():
    return {{"status": "ok", "engine": "weasyprint"}}
