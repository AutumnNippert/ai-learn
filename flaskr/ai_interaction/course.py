import json
from json import JSONEncoder

class Lesson:
    def __init__(self, title:str, info:str):
        self.title = title
        self.info = info
    
    def __str__(self):
        """Lesson title"""
        return self.title

class Module:
    def __init__(self, title:str):
        self.title = title
        self.lessons = []

    def add_lesson(self, lesson:Lesson):
        self.lessons.append(lesson)

    def __str__(self):
        """Module title"""
        return self.title

class Course:
    def __init__(self, title:str, description:str):
        self.title = title
        self.description = description
        self.modules = []

    def add_module(self, module:Module):
        self.modules.append(module)

    def write_to_file(self, file_name:str):
        courseJson = json.dumps(self, indent=4, cls=CourseEncoder)
        with open("out/"+file_name, "w") as f:
            f.write(courseJson)

    def from_file(file_name:str):
        with open(file_name, "r") as f:
            courseJson = f.read()
            course = json.loads(courseJson)
            return course
        

    def __str__(self):
        """Course title, and brief description"""
        return self.title + "\n" + self.description
    
class CourseEncoder(JSONEncoder):
    def default(self, o):
        return o.__dict__


# Tests
if __name__ == "__main__":
    c = Course("Software Development", "This is a course on software development")
    l = Lesson("Test Lesson", "Woah! Info")
    m = Module("Test Module")
    m.add_lesson(l)
    c.add_module(m)

    l = Lesson("Test Lesson 2", "Woah! Info 2")
    m = Module("Test Module 2")

    m.add_lesson(l)
    c.add_module(m)

    c.write_to_file("test.json")