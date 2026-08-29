import csv

with open('084c_dump.csv', 'r') as f:
    reader = csv.reader(f)
    rows = list(reader)

# Let's print rows 16, 17, 18 with exact column indexing
for i in range(15, 19):
    row = rows[i]
    print(f"Row {i+1}:")
    for j, val in enumerate(row):
        if val.strip():
            print(f"  Col {j+1}: '{val.strip()}'")
