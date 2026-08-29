import csv
with open('084a_dump.csv', 'r') as f:
    reader = csv.reader(f)
    for i, row in enumerate(reader):
        if i >= 10 and i <= 24:
            line = []
            for j, val in enumerate(row):
                if val.strip():
                    line.append(f"C{j+1}:{val.strip()}")
            if line:
                print(f"R{i+1}: " + " | ".join(line))
