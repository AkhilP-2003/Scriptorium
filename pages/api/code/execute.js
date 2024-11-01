import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

const TEMP_DIR = path.join(process.cwd(), 'temp'); // Temporary directory for files

// Ensure the temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { code, language, stdin = "" } = req.body;

    // Handle Java class naming if necessary
    const classNameMatch = code.match(/class\s+(\w+)/);
    const className = classNameMatch ? classNameMatch[1] : `Class_${uuidv4()}`;
    const jobId = uuidv4(); // Unique identifier for each execution job
    let fileName;

    // Determine the file extension and create a temporary file
    switch (language) {
        case 'python':
            fileName = path.join(TEMP_DIR, `${jobId}.py`);
            fs.writeFileSync(fileName, code);
            executePythonCode(fileName, res, stdin);
            break;
        case 'java':
            fileName = path.join(TEMP_DIR, `${className}.java`);
            fs.writeFileSync(fileName, code);
            executeJavaCode(fileName, res, stdin);
            break;
        case 'c':
            fileName = path.join(TEMP_DIR, `${jobId}.c`);
            fs.writeFileSync(fileName, code);
            executeCCode(fileName, res, stdin);
            break;
        case 'cpp':
            fileName = path.join(TEMP_DIR, `${jobId}.cpp`);
            fs.writeFileSync(fileName, code);
            executeCppCode(fileName, res, stdin);
            break;
        default:
            return res.status(400).json({ status: "error", output: "Unsupported language" });
    }
}

// Execute Python code with spawn
function executePythonCode(filePath, res, stdin) {
    const process = spawn('python', [filePath]);

    process.stdin.write(stdin); // Write stdin input
    process.stdin.end();

    let output = '';
    process.stdout.on('data', (data) => {
        output += data.toString();
    });

    let error = '';
    process.stderr.on('data', (data) => {
        error += data.toString();
    });

    process.on('close', (code) => {
        cleanup(filePath);
        if (code !== 0) {
            return res.status(200).json({ status: "error", output: error });
        }
        return res.status(200).json({ status: "success", output: output });
    });
}

// Execute Java code with spawn
function executeJavaCode(filePath, res, stdin) {
    const className = path.basename(filePath, '.java');
    const compile = spawn('javac', [filePath]);

    let error = '';
    compile.stderr.on('data', (data) => {
        error += data.toString();
    });

    compile.on('close', (code) => {
        if (code !== 0) {
            cleanup(filePath);
            return res.status(200).json({ status: "error", output: error });
        }

        const run = spawn('java', [className], { cwd: TEMP_DIR });
        run.stdin.write(stdin);
        run.stdin.end();

        let output = '';
        run.stdout.on('data', (data) => {
            output += data.toString();
        });

        run.stderr.on('data', (data) => {
            error += data.toString();
        });

        run.on('close', (code) => {
            cleanup(filePath);
            cleanup(path.join(TEMP_DIR, `${className}.class`));
            if (code !== 0) {
                return res.status(200).json({ status: "error", output: error });
            }
            return res.status(200).json({ status: "success", output: output });
        });
    });
}

// Execute C code with spawn
function executeCCode(filePath, res, stdin) {
    const outputFile = path.join(TEMP_DIR, `${path.basename(filePath, '.c')}.out`);
    console.log(outputFile)
    const compile = spawn('gcc', [filePath, '-o', outputFile]);

    let error = '';
    compile.stderr.on('data', (data) => {
        error += data.toString();
    });

    compile.on('close', (code) => {
        if (code !== 0) {
            cleanup(filePath);
            return res.status(200).json({ status: "error", output: error });
        }

        const run = spawn(outputFile);
        run.stdin.write(stdin);
        run.stdin.end();

        let output = '';
        run.stdout.on('data', (data) => {
            output += data.toString();
        });

        run.stderr.on('data', (data) => {
            error += data.toString();
        });

        run.on('close', (code) => {
            cleanup(filePath);
            cleanup(outputFile);
            if (code !== 0) {
                return res.status(200).json({ status: "error", output: error });
            }
            return res.status(200).json({ status: "success", output: output });
        });
    });
}

// Execute C++ code with spawn
function executeCppCode(filePath, res, stdin) {
    const outputFile = path.join(TEMP_DIR, `${path.basename(filePath, '.cpp')}.out`);
    const compile = spawn('g++', [filePath, '-o', outputFile]);

    let error = '';
    compile.stderr.on('data', (data) => {
        error += data.toString();
    });

    compile.on('close', (code) => {
        if (code !== 0) {
            cleanup(filePath);
            return res.status(200).json({ status: "error", output: error });
        }

        const run = spawn(outputFile);
        run.stdin.write(stdin);
        run.stdin.end();

        let output = '';
        run.stdout.on('data', (data) => {
            output += data.toString();
        });

        run.stderr.on('data', (data) => {
            error += data.toString();
        });

        run.on('close', (code) => {
            cleanup(filePath);
            cleanup(outputFile);
            if (code !== 0) {
                return res.status(200).json({ status: "error", output: error });
            }
            return res.status(200).json({ status: "success", output: output });
        });
    });
}

// Cleanup temporary files
function cleanup(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}
