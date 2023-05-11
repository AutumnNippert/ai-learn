def write_to_file(file_name:str, text:str):
    with open("out/"+file_name, "w") as f:
        f.write(text)

def append_to_file(file_name:str, text:str):
    with open("out/"+file_name, "a") as f:
        f.write(text)

def log(text:str):
    append_to_file("log.txt", text + "\n")