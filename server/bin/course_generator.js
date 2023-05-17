const fs = require("fs");
const { log } = require("./logger");
const { generateResponse, generateImage } = require("./api_interaction");
const { Course, Module, Lesson } = require("../class/course");

let config = fs.readFileSync("res/content_config.json");
let serverConfig = fs.readFileSync("res/server_config.json");
config = JSON.parse(config);
serverConfig = JSON.parse(serverConfig);

const noai = serverConfig.NO_AI;

function get_new_id() {
	const id = parseInt(fs.readFileSync("res/id.txt", "utf8"));
	const newId = id + 1;
	fs.writeFileSync("res/id.txt", newId.toString());
	return newId;
}

async function* generateCourse(topic, moduleCount = 4) {
	const id = get_new_id();
	if (!noai) {
		downloadImage(await generateImage(topic), `res/images/${id}.png`);
	}
	
	const course = new Course(topic, 'none', id, 'https://liftlearning.com/wp-content/uploads/2020/09/default-image.png');
	let lessonPlan = await generateCoursePlan(topic, moduleCount);
	let moduleHeaders = [];

	// Get lesson headers (after the "#. " and before the "\n")
	let lines = lessonPlan.split("\n");
	lines.forEach((line) => {
		m = line.split(". ")[1];
		// if not null, push to lessons
		if (m) {
			moduleHeaders.push(m);
		}
	});

	const eta = (moduleHeaders.length * 350) / 60.0; // 350 seconds per module
	const etaDateTime = new Date(Date.now() + eta * 60000);
	log(`Estimated time to complete: ${eta} minutes | ${etaDateTime.toLocaleString("en-US", { hour: "numeric", minute: "numeric", hour12: true })}`);

	let percentComplete = 0;

	// For each lesson header, create a sub lesson
	for (const header of moduleHeaders) {
		log(`Generating module: ${header}`);
		const module = new Module(header);
		const lessonsStr = await generateLessons(lessonPlan, header);
		const lessons = [];

		// Get lesson headers (after the "#. " and before the "\n")
		const lines = lessonsStr.split("\n");
		lines.forEach((line) => {
			const l = line.split(". ")[1];
			// if not null, push to lessons
			if (l) {
				lessons.push(l);
			}
		});

		lessonPlan += "\n Lessons: " + lessonsStr;

		// How big is each lesson in terms of percent of the total course?
		const lessonSize = 1.0 / (moduleHeaders.length * lessons.length);
		for (const lesson of lessons) {
			log(`${percentComplete * 100}% complete. Generating Lesson: ${lesson}`);
			yield { lesson, percentComplete };
			let info;
			if (noai) {
				info = "testInfo.";
			} else {
				info = await createLessonInfo(lessonPlan, lesson);
			}
			const subLesson = new Lesson(lesson, info);
			module.addLesson(subLesson);
			percentComplete += lessonSize;
		}

		course.addModule(module);
	}
	log("100.0% complete. Finishing up...");

	const description = await generateBriefDescription(topic, lessonPlan);
	course.description = description;

	const serverUrl = serverConfig.PROTOCOL + "://" + serverConfig.HOSTNAME + ":" + serverConfig.PORT + "/API";
	course.image = serverUrl + "/images/" + course.id;
	if (noai) {
		course.image = "https://liftlearning.com/wp-content/uploads/2020/09/default-image.png";
	}
	log("Course generated successfully.")
	course.toFile(`${course.id}.json`);
	return { course, percentComplete: 100 };
}

async function generateBriefDescription(topic, lessonPlan) {
	if (noai) {
		return "This is a test description.";
	}
	const prompt = "Create a short, one sentence description for this class:\n" + topic + "\n" + lessonPlan + ". Respond with only the description.";
	let history = [{ role: "user", content: prompt }];
	console.log(history);
	const description = await generateResponse(history);
	return description;
}

async function generateCoursePlan(topic, moduleCount) {
	if (noai) {
		return "1. module1\n2. module2";
	}
	const prompt = `Create a list of ${moduleCount} modules for a class on ${topic}. Respond with only the list of modules, numbered as '1. ', '2. ', etc...`;

	// Generate a lesson plan
	const history = [{ role: "user", content: prompt }];
	const lessonPlan = await generateResponse(history);
	return String(lessonPlan);
}

async function generateLessons(lessonPlan, moduleHeader) {
	if (noai) {
		return "1. lesson1\n2. lesson2";
	}
	// Develop a lesson
	const prompt = `Create a list of sub lessons for a module on ${moduleHeader} that is around 3 to 8 sub lessons. Respond with only the list of sub lessons, numbered as '1. ', '2. ', and NOT '1.1' or the like.`;
	const history = [];
	history.push({ "role": "system", "content": "Current Lesson Plan" + lessonPlan });
	history.push({ "role": "user", "content": prompt });
	lessonPlan = await generateResponse(history);
	return lessonPlan;
}

async function createLessonInfo(lessonPlan, lessonHeader) {
	if (noai) {
		return "This is a test lesson info.";
	}
	// Create lesson info
	const prompt = `Create lesson content about ${lessonHeader}. Respond with only the lesson content.`;
	const history = [];
	history.push({ "role": "system", "content": "Current Lesson Plan" + lessonPlan });
	history.push({ "role": "user", "content": prompt });
	history.push({ role: "system", content: "An example lesson template:\n" + config.EXAMPLE_CONTENT })
	const lessonInfo = await generateResponse(history);
	return lessonInfo;
}

async function downloadImage(url, filepath) {
	const https = require('https');
	const file = fs.createWriteStream(filepath);
	return new Promise((resolve, reject) => {
		https.get(url, (response) => {
			if (response.statusCode !== 200) {
				reject(new Error(`Failed to download image. Status code: ${response.statusCode}`));
			}
			response.pipe(file);
			file.on('finish', () => {
				file.close();
				resolve();
			});
		}).on('error', (error) => {
			reject(new Error(`Failed to download image. Error: ${error.message}`));
		});
	});
}

async function generateCourseImage(topic) {
	if (noai) {
		return "https://liftlearning.com/wp-content/uploads/2020/09/default-image.png";
	}
	// Generate an image of the lesson plan
	const imageUrl = await generateImage(topic);
	return imageUrl;
}

function test(topic) {
	const course = generateCourse(topic);
	course.writeToFile(`${course.id}.json`);
}


module.exports = { generateCourse, generateCourseImage };