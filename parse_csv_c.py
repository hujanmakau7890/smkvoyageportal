import csv
with open('084c_dump.csv', 'r') as f:
    reader = csv.reader(f)
    rows = list(reader)

for i in range(5, min(30, len(rows))):
    row = rows[i]
    vals = []
    for j, val in enumerate(row):
        val = val.strip()
        if val:
            vals.append(f"C{j+1}: '{val}'")
    if vals:
        print(f"R{i+1}: {', '.join(vals)}")
