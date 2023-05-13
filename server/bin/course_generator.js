const fs = require("fs");
const { log } = require("./logger");
const { generateResponse, generateImage } = require("./api_interaction");
const { Course, Module, Lesson } = require("./course");

function get_new_id() {
	const id = parseInt(fs.readFileSync("res/id.txt", "utf8"));
	const newId = id + 1;
	fs.writeFileSync("res/id.txt", newId.toString());
	return newId;
}

async function generateCourse(topic, moduleCount = 4) {
	const course = new Course(topic, 'none', get_new_id());
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

	const eta = (moduleHeaders.length * 100) / 60.0;
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
			const info = await createLessonInfo(lessonPlan, lesson);
			const subLesson = new Lesson(lesson, info);
			module.addLesson(subLesson);
			percentComplete += lessonSize;
		}

		course.addModule(module);
	}
	
	const description = await generateBriefDescription(topic);
	course.description = description;

	log("100.0% complete. Course generated!");
	return course;
}

async function generateBriefDescription(topic, lessonPlan) {
	const prompt = "Create a short, one sentence description for this class:\n" + topic + "\n" + lessonPlan + ". Respond with only the description.";
	const description = await generateResponse([{ role: "user", content: prompt }]);
	return description;
}

async function generateCoursePlan(topic, moduleCount) {
	const prompt = `Create a list of ${moduleCount} modules for a class on ${topic}. Respond with only the list of modules, numbered as '1. ', '2. ', etc...`;

	// Generate a lesson plan
	const history = [{ role: "user", content: prompt }];
	const lessonPlan = await generateResponse(history);
	return String(lessonPlan);
}

async function generateLessons(lessonPlan, moduleHeader) {
	// Develop a lesson
	const prompt = `Create a list of sub lessons for a module on ${moduleHeader} that is around 4 to 5 sub lessons. Respond with only the list of sub lessons, numbered as '1. ', '2. ', and NOT '1.1' or the like.`;
	const history = [];
	history.push({ "role": "system", "content": "Current Lesson Plan" + lessonPlan });
	history.push({ "role": "user", "content": prompt });
	lessonPlan = await generateResponse(history);
	return lessonPlan;
}

async function createLessonInfo(lessonPlan, lessonHeader) {
	// Create lesson info
	const prompt = `Create lesson content about ${lessonHeader} as if it were for a class. Be sure to include examples for things you may cover. Feel free to add in helpful images as links. You can add Questions with answers and other quiz like things. Make it 2 to 3 paragraphs long. Respond with only the lesson content.`;
	const history = [];
	history.push({ "role": "system", "content": "Current Lesson Plan" + lessonPlan });
	history.push({ "role": "user", "content": prompt });
	const lessonInfo = await generateResponse(history);
	return lessonInfo;
}

async function generateCourseImage(topic) {
	// Generate an image of the lesson plan
	const imageUrl = await generateImage(topic);
	return imageUrl;
}

function test(topic) {
	const course = generateCourse(topic);
	course.writeToFile(`${course.id}.json`);
}


module.exports = { generateCourse, generateCourseImage };