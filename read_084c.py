import openpyxl

wb = openpyxl.load_workbook("/DATA/Documents/Master Form/084 C - Ballast Tank Condition REport (Void).xlsx", data_only=True)
ws = wb.active

for r in range(11, 25): # 1-indexed in openpyxl
    row_vals = []
    for c in range(1, 17):
        val = ws.cell(row=r, column=c).value
        if val is not None and str(val).strip() != "":
            row_vals.append(f"C{c}='{val}'")
    if row_vals:
        print(f"R{r}: {', '.join(row_vals)}")
