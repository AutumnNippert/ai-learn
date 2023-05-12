from bin.logger import log
from bin.api_interaction import generate_response, generate_image
from bin.course import Course, Module, Lesson

def get_new_id():
    with open("out/id.txt", "r") as f:
        id = int(f.read())
        id += 1
        with open("out/id.txt", "w") as f:
            f.write(str(id))
            return id

def generate_course(topic:str, module_count:int=3):
    # Create a course
    description = generate_brief_description(topic)
    c = Course(topic, description, get_new_id())
    
    lessons = []
    # Generate a lesson plan
    lesson_plan = generate_course_plan(topic, module_count)

    module_headers = []

    # get lesson headers (after the "#. " and before the "\n")
    lines = lesson_plan.split("\n")
    for line in lines:
        module_headers += line.split(". ")[1:]

    eta = len(module_headers) * 100 / 60.0
    from datetime import datetime, timedelta
    eta_date_time = datetime.now() + timedelta(minutes=eta)
    log(f"Estimated time to complete: {eta} minutes | {eta_date_time.strftime('%I:%M %p')}")

    percent_complete = 0
    
    # for each lesson header, create a sub lesson
    for header in module_headers:
        log(f"Generating module: {header}")
        m = Module(header)
        lessons_str = generate_lessons(lesson_plan, header)

        lessons = []
        lines = lessons_str.split("\n")
        for line in lines:
            lessons += line.split(". ")[1:]

        lesson_plan += "\n Lessons: " + lessons_str

        # how big is each lesson in terms of percent of the total course?
        lesson_size = 1.0 / len(module_headers) / len(lessons)
        for lesson in lessons:
            log(f"{percent_complete*100:.1f}% complete. Generating Lesson: {lesson}")
            info = create_lesson_info(lesson_plan, lesson)
            l = Lesson(lesson, info)
            m.add_lesson(l)
            percent_complete += lesson_size
        c.add_module(m)

    log(f"100.0% complete. Course generated!")
    return c

def generate_brief_description(topic:str):
    prompt = "Create a brief description of a class on " + topic + ". Respond with only the description."
    description = generate_response(model="gpt-3.5-turbo", history=[{"role": "user", "content": prompt}])
    return description


def generate_course_plan(topic:str, module_count:int):
    prompt = "Create a list of " + str(module_count) + " modules for a class on " + topic + ". Respond with only the list of modules, numbered as '1. ', '2. ', etc..."

    # Generate a lesson plan
    history = []
    history.append({"role": "user", "content": prompt})
    lesson_plan = generate_response(model="gpt-3.5-turbo", history=history)
    return lesson_plan

def generate_lessons(lesson_plan:str, module_header:str):
    # Develop a lesson
    prompt = "Create a list of sub lessons for a module on " + module_header + " that is around 4 to 5 sub lessons. Respond with only the list of sub lessons, numbered as '1. ', '2. ', and NOT '1.1' or the like."
    history = []
    history.append({"role": "system", "content": "Current Lesson Plan" + lesson_plan})
    history.append({"role": "user", "content": prompt})
    lesson_plan = generate_response(model="gpt-3.5-turbo", history=history)
    return lesson_plan

def create_lesson_info(lesson_plan:str, lesson_header:str):
    # Create lesson info
    prompt = "Create lesson content about " + lesson_header + " as if it were for a class. Be sure to include examples for things you may cover. Feel free to add in helpful images as links. You can add Questions with answers and other quiz like things. Make it 2 to 3 paragraphs long. Respond with only the lesson content."
    history = []
    history.append({"role": "system", "content": "Current Lesson Plan" + lesson_plan})
    history.append({"role": "user", "content": prompt})
    lesson_info = generate_response(model="gpt-3.5-turbo", history=history)
    return lesson_info
    
def generate_course_image(topic:str):
    # Generate an image of the lesson plan
    image_url = generate_image(prompt=topic)
    return image_url

def test(topic:str):
    course = generate_course(topic)
    course.write_to_file(str(course.id) + ".json")
    