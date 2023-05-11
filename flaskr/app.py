from flask import Flask, render_template, request, redirect, url_for, flash, session
from bin.course import Course
from bin.course_generator import generate_course
from bin.logger import log
import json

app = Flask(__name__)

# Path: flaskr\app.py
@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')

@app.route('/course/<course_id>', methods=['GET', 'POST'])
def course(course_id:str):
    # get course from out/Wireless Networks.json
    c = Course.from_file(f"{course_id}.json")
    return render_template('course.html', course=c)

@app.route(f'/add_course', methods=['POST'])
def add_course():
    course_title:str = request.form['courseName']
    log(f"Generating course: {course_title}")
    course = generate_course(course_title)
    course.to_file(f"{course.id}.json")
    return redirect(url_for('course', course_id=course.id))

app.run(debug=True)