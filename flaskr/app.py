from flask import Flask, render_template, request, redirect, url_for, flash, session
from bin.course import Course
from bin.course_generator import generate_course
from bin.logger import log
import json

app = Flask(__name__)

# Path: flaskr\app.py
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/course', methods=['GET', 'POST'])
def course():
    # get course from out/Wireless Networks.json
    c = Course.from_file("out/Strategies for teaching people who need to learn english in a classroom.json")
    return render_template('course.html', course=c)

@app.route(f'/add_course/<course_title>', methods=['POST'])
def add_course(course_title:str):
    log(f"Generating course: {course_title}")
    generate_course(course_title)
    return json.dumps(True) # Succeeded

app.run(debug=True)