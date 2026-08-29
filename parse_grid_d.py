import csv

with open('/tmp/084d_dump.csv', 'r') as f:
    reader = csv.reader(f)
    rows = list(reader)

for r_idx in range(8, 26):
    if r_idx < len(rows):
        row = rows[r_idx]
        formatted = []
        for c_idx in range(2, 17): # cols C to Q (index 2 to 16)
            val = row[c_idx].strip() if c_idx < len(row) else ""
            if len(val) > 12:
                val = val[:10] + ".."
            formatted.append(f"{val:12}")
        print(f"R{r_idx+1:02d}: | " + " | ".join(formatted) + " |")
