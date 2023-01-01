import csv
with open("./2.csv","r",encoding="utf-8")as fp:
    reader = csv.reader(fp)
    for x in reader:
        print(x)