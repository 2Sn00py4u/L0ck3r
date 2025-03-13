csvPath = "backend\\test\\test.csv"

with open(csvPath, "r") as csvFile:
    attributes = []
    values = []
    for i, line in enumerate(csvFile):
        if i == 0:
            line = line.split(";")
            line.pop(len(line)-1)
            attributes.append(tuple(line))
        else:
            line = line.split(";")
            line.pop(len(line)-1)
            values.append(tuple(line))
    csvFile.close()
    print(attributes, values)