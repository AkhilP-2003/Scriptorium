import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

const TEMP_DIR = path.join(process.cwd(), 'temp');

// Ensure the temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

export async function executeCode(code, language, stdin = "") {
    const jobId = uuidv4(); // Unique identifier for each execution job
    let fileName;

    // Determine the file extension and create a temporary file
    switch (language) {
        case 'python':
            fileName = path.join(TEMP_DIR, `${jobId}.py`);
            fs.writeFileSync(fileName, code);
            return await executePythonCode(fileName, stdin);
        case 'java':
            try{
            fileName = path.join(TEMP_DIR, `${path.basename(code.match(/class\s+(\w+)/)[1])}.java`);
            } catch (error){
                throw new Error("Invalid Java Script");
            }
            fs.writeFileSync(fileName, code);
            return await executeJavaCode(fileName, stdin);
        case 'c':
            fileName = path.join(TEMP_DIR, `${jobId}.c`);
            fs.writeFileSync(fileName, code);
            return await executeCCode(fileName, stdin);
        case 'cpp':
            fileName = path.join(TEMP_DIR, `${jobId}.cpp`);
            fs.writeFileSync(fileName, code);
            return await executeCppCode(fileName, stdin);
        case 'javascript':
            fileName = path.join(TEMP_DIR, `${jobId}.js`);
            fs.writeFileSync(fileName, code);
            return await executeJavaScriptCode(fileName, stdin);
        default:
            throw new Error("Unsupported language");
    }
}

// Execute Python code
async function executePythonCode(filePath, stdin) {
    return new Promise((resolve) => {
        const process = spawn('python3', [filePath]);

        process.stdin.write(stdin);
        process.stdin.end();

        let output = '';
        let error = '';

        process.stdout.on('data', (data) => {
            output += data.toString();
        });

        process.stderr.on('data', (data) => {
            error += data.toString();
        });

        process.on('close', (code) => {
            cleanup(filePath);
            resolve({ output, error });
        });
    });
}

// Execute Java code
async function executeJavaCode(filePath, stdin) {
    return new Promise((resolve) => {
        const className = path.basename(filePath, '.java');
        const compile = spawn('javac', [filePath]);

        let error = '';
        compile.stderr.on('data', (data) => {
            error += data.toString();
        });

        compile.on('close', (code) => {
            if (code !== 0) {
                cleanup(filePath);
                return resolve({ output: '', error });
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
                resolve({ output, error });
            });
        });
    });
}

// Execute C code
async function executeCCode(filePath, stdin) {
    return new Promise((resolve) => {
        const outputFile = path.join(TEMP_DIR, `${path.basename(filePath, '.c')}.out`);
        const compile = spawn('gcc', [filePath, '-o', outputFile]);

        let error = '';
        compile.stderr.on('data', (data) => {
            error += data.toString();
        });

        compile.on('close', (code) => {
            if (code !== 0) {
                cleanup(filePath);
                return resolve({ output: '', error });
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
                resolve({ output, error });
            });
        });
    });
}

// Execute C++ code
async function executeCppCode(filePath, stdin) {
    return new Promise((resolve) => {
        const outputFile = path.join(TEMP_DIR, `${path.basename(filePath, '.cpp')}.out`);
        const compile = spawn('g++', [filePath, '-o', outputFile]);

        let error = '';
        compile.stderr.on('data', (data) => {
            error += data.toString();
        });

        compile.on('close', (code) => {
            if (code !== 0) {
                cleanup(filePath);
                return resolve({ output: '', error });
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
                resolve({ output, error });
            });
        });
    });
}

// Execute JavaScript code
async function executeJavaScriptCode(filePath, stdin) {
    return new Promise((resolve) => {
        const process = spawn('node', [filePath]);

        process.stdin.write(stdin);
        process.stdin.end();

        let output = '';
        let error = '';

        process.stdout.on('data', (data) => {
            output += data.toString();
        });

        process.stderr.on('data', (data) => {
            error += data.toString();
        });

        process.on('close', (code) => {
            cleanup(filePath);
            resolve({ output, error });
        });
    });
}

// Cleanup temporary files
function cleanup(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}
