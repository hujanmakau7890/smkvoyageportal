import csv

with open('084c_dump.csv', 'r') as f:
    reader = csv.reader(f)
    rows = list(reader)

for r_idx in range(8, 25): # rows 9 to 25
    row = rows[r_idx]
    formatted = []
    for c_idx in range(2, 26): # cols C to Z (index 2 to 25)
        val = row[c_idx].strip() if c_idx < len(row) else ""
        if len(val) > 15:
            val = val[:12] + "..."
        formatted.append(f"{val:15}")
    print(f"R{r_idx+1:02d}: | " + " | ".join(formatted) + " |")
