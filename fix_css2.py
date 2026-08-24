import re

with open('public/smk-forms/001_Ship_Certificate_Check_List.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Make table-responsive apply globally, not just on mobile
css_to_find = """        /* Responsive Table adjustments for Mobile - Only apply to screen, NOT print */
        @media screen and (max-width: 768px) {
            .table-responsive {
                overflow-x: auto;
                display: block;
                width: 100%;
            }
            /* Override tailwind classes and ensure fixed widths on mobile so text fits inside cells */
            table.table-fixed {
                table-layout: auto !important; /* Allow columns to stretch based on content */
                min-width: 800px; /* Force horizontal scroll */
            }
            th, td {
                min-width: 90px; /* Ensure columns have enough space for DD-MM-YYYY */
                white-space: nowrap; /* Prevent wrapping in data cells */
            }
            th:nth-child(2), td:nth-child(2) {
                min-width: 200px;
                white-space: normal; /* Let the cert names wrap */
            }
            td input {
                width: 100% !important;
                min-width: 80px;
            }
            .remarks-input {
                min-width: 120px;
            }
        }"""

css_to_replace = """        /* Responsive Table adjustments - Apply globally to ensure scroll on any small screen */
        @media screen {
            .table-responsive {
                overflow-x: auto;
                display: block;
                width: 100%;
                -webkit-overflow-scrolling: touch;
            }
            table.table-fixed {
                table-layout: auto !important;
                min-width: 900px; /* Force horizontal scroll if screen is smaller than 900px */
            }
            th, td {
                min-width: 90px;
                white-space: nowrap;
            }
            th:nth-child(2), td:nth-child(2) {
                min-width: 200px;
                white-space: normal;
            }
            td input {
                width: 100% !important;
                min-width: 80px;
            }
            .remarks-input {
                min-width: 120px;
            }
        }"""

html = html.replace(css_to_find, css_to_replace)

with open('public/smk-forms/001_Ship_Certificate_Check_List.html', 'w', encoding='utf-8') as f:
    f.write(html)
