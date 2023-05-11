from flask import Flask, render_template, request, redirect, url_for, flash, session
from ai_interaction.course import Course, Module, Lesson

app = Flask(__name__)

# Path: flaskr\app.py
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/course', methods=['GET', 'POST'])
def course():
    # get course from out/Wireless Networks.json
    c = Course.from_file("out/Wireless Networks.json")
    return render_template('course.html', course=c)

app.run(debug=True)