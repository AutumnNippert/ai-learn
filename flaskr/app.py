from flask import Flask, render_template, request, redirect, url_for, flash, session

app = Flask(__name__)

# Path: flaskr\app.py
@app.route('/')
def index():
    return render_template('index.html')