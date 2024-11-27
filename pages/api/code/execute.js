import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

const TEMP_DIR = path.join(process.cwd(), 'temp'); // Temporary directory for files
var className = ""

// Ensure the temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { code, language, stdin = "" } = req.body;

    if (!code || !language) {
        return res.status(400).json({ message: 'Code and language are required' });
    }

    // Handle Java class naming if necessary
    const classNameMatch = code.match(/class\s+(\w+)/);
    className = classNameMatch ? classNameMatch[1] : `Class_${uuidv4()}`;
    const jobId = uuidv4(); // Unique identifier for each execution job
    let fileName;

    // Determine the file extension and create a temporary file
    switch (language) {
        case 'python':
            fileName = path.join(TEMP_DIR, `${jobId}.py`);
            fs.writeFileSync(fileName, code);
            executeCodeInDocker(fileName, stdin, 'python', res);
            break;
        case 'java':
            fileName = path.join(TEMP_DIR, `${className}.java`);
            fs.writeFileSync(fileName, code);
            executeCodeInDocker(fileName, stdin, 'java', res);
            break;
        case 'c':
            fileName = path.join(TEMP_DIR, `${jobId}.c`);
            fs.writeFileSync(fileName, code);
            executeCodeInDocker(fileName, stdin, 'c', res);
            break;
        case 'cpp':
            fileName = path.join(TEMP_DIR, `${jobId}.cpp`);
            fs.writeFileSync(fileName, code);
            executeCodeInDocker(fileName, stdin, 'cpp', res);
            break;
        case 'javascript':
            fileName = path.join(TEMP_DIR, `${jobId}.js`);
            fs.writeFileSync(fileName, code);
            executeCodeInDocker(fileName, stdin, 'javascript', res);
            break;
        case 'r':
            fileName = path.join(TEMP_DIR, `${jobId}.r`);
            fs.writeFileSync(fileName, code);
            executeCodeInDocker(fileName, stdin, 'r', res);
            break;
        case 'go':
            fileName = path.join(TEMP_DIR, `${jobId}.go`);
            fs.writeFileSync(fileName, code);
            executeCodeInDocker(fileName, stdin, 'go', res);
            break;
        case 'php':
            fileName = path.join(TEMP_DIR, `${jobId}.php`);
            fs.writeFileSync(fileName, code);
            executeCodeInDocker(fileName, stdin, 'php', res);
            break;
        case 'ruby':
            fileName = path.join(TEMP_DIR, `${jobId}.rb`);
            fs.writeFileSync(fileName, code);
            executeCodeInDocker(fileName, stdin, 'ruby', res);
            break;
        case 'perl':
            fileName = path.join(TEMP_DIR, `${jobId}.pl`);
            fs.writeFileSync(fileName, code);
            executeCodeInDocker(fileName, stdin, 'perl', res);
            break;
        default:
            return res.status(400).json({ status: "error", output: "Unsupported language" });
    }
}

// Function to execute code inside Docker container
function executeCodeInDocker(filePath, stdin, language, res) {
    // Get the code file name
    const fileName = path.basename(filePath);

    // Prepare the Docker command
    console.log(TEMP_DIR)
    let dockerCommand = 'docker run -i --rm --memory="128m" -v "' + TEMP_DIR + ':/app"';

    // Choose the appropriate Docker image based on the language
    switch (language) {
        case 'python':
            dockerCommand += ' python-runner /app/' + fileName;
            break;
        case 'java':
            dockerCommand += ' java-runner ' + className;
            break;
        case 'c':
            dockerCommand += ' c-runner /app/' + fileName;
            break;
        case 'cpp':
            dockerCommand += ' cpp-runner /app/' + fileName;
            break;
        case 'javascript':
            dockerCommand += ' node /app/' + fileName;
            break;
        case 'r':
            dockerCommand += ' r-runner /app/' + fileName;
            break;
        case 'go':
            dockerCommand += ' go-runner /app/' + fileName;
            break;
        case 'php':
            dockerCommand += ' php-runner /app/' + fileName;
            break;
        case 'ruby':
            dockerCommand += ' ruby-runner /app/' + fileName;
            break;
        case 'perl':
            dockerCommand += ' perl-runner /app/' + fileName;
            break;
        default:
            return res.status(400).json({ status: 'error', output: 'Unsupported language' });
    }

    // Execute the command
    console.log(dockerCommand)
    const process = spawn(dockerCommand, { shell: true,
        stdio: ['pipe']
    });

    // Write stdin if provided
    if (stdin) {
        process.stdin.write(stdin);
        process.stdin.end();
    }

    let output = '';
    let error = '';

    process.stdout.on('data', (data) => {
        if (output.length + data.length > 1024 * 1024) { // Limit to 1MB
            if (process.connected){
                process.kill();
            }
            cleanup(filePath);
            return res.status(413).json({ status: "error", output: "Output exceeded 1MB limit." });
        }
        output += data.toString();
    });
    
    process.stderr.on('data', (data) => {
        if (error.length + data.length > 1024 * 1024) { // Limit to 1MB
            if (process.connected){
                process.kill();
            }
            cleanup(filePath);
            return res.status(413).json({ status: "error", output: "Error output exceeded 1MB limit." });
            
        }
        error += data.toString();
    });

    const timeout = setTimeout(() => {
        if (process.connected){
            process.kill();
        }
        return res.status(408).json({ status: "error", output: "Execution timed out after 15 seconds" });
    }, 15000); // 15 seconds timeout

    process.on('close', (code) => {

        clearTimeout(timeout);
        console.log(`Process exited with code: ${code}`);
        cleanup(filePath);
        if (code !== 0) {

            if (code === 137) {
                return res.status(200).json({ status: "error", output: "Memory limit exceeded" });
            }

            return res.status(200).json({ status: "error", output: error });
        }
        return res.status(200).json({ status: "success", output: output });
    });
}

function cleanup(filePath) {
    try {
        const fileName = path.basename(filePath);
        const filePathToDelete = path.join(TEMP_DIR, fileName);

        if (fs.existsSync(filePathToDelete)) {
            fs.unlinkSync(filePathToDelete);  // Delete the file
        }
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
}