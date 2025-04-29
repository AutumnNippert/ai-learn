import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { CourseMeta } from '../class/course.js';

// Setup __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read all files from res/courses
const coursesDir = path.join(__dirname, '../res/courses');
const courseFiles = await fs.readdir(coursesDir);

let courseMetaList = [];

for (const file of courseFiles) {
    if (!file.endsWith('.json')) continue;

    const filePath = path.join(coursesDir, file);
    const content = await fs.readFile(filePath, 'utf8');
    const courseJson = JSON.parse(content);

    const meta = new CourseMeta(
        courseJson.title,
        courseJson.description,
        courseJson.id,
        courseJson.image || 'https://liftlearning.com/wp-content/uploads/2020/09/default-image.png'
    );

    courseMetaList.push(meta);
}

// Sort descending by course ID
courseMetaList.sort((a, b) => b.id - a.id);

// Wrap in object
const output = { courses: courseMetaList };

// Write to res/courses.json
const outputPath = path.join(__dirname, '../res/courses.json');
await fs.writeFile(outputPath, JSON.stringify(output, null, 4));

console.log(`Wrote ${courseMetaList.length} courses to courses.json`);
