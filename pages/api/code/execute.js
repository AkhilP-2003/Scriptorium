import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

const TEMP_DIR = path.join(process.cwd(), 'temp'); // Temporary directory for files

// Ensure the temp directory exists
if (!fs.existsSync(TEMP_DIR)){
    fs.mkdirSync(TEMP_DIR);
}

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { code, language } = req.body;
    const jobId = uuidv4();  // Unique identifier for each execution job
    let fileName;
    
    // Determine the file extension and create a temporary file
    switch (language) {
        case 'python':
            fileName = path.join(TEMP_DIR, `${jobId}.py`);
            fs.writeFileSync(fileName, code);
            executePythonCode(fileName, res);
            break;
        case 'java':
            fileName = path.join(TEMP_DIR, `${jobId}.java`);
            fs.writeFileSync(fileName, code);
            executeJavaCode(fileName, res);
            break;
        case 'c':
            fileName = path.join(TEMP_DIR, `${jobId}.c`);
            fs.writeFileSync(fileName, code);
            executeCCode(fileName, res);
            break;
        case 'cpp':
            fileName = path.join(TEMP_DIR, `${jobId}.cpp`);
            fs.writeFileSync(fileName, code);
            executeCppCode(fileName, res);
            break;
        default:
            return res.status(400).json({ status: "error", output: "Unsupported language" });
    }
}

// Execute Python code
function executePythonCode(filePath, res) {
    execFile('python', [filePath], (error, stdout, stderr) => {
        cleanup(filePath);
        if (error) {
            return res.status(200).json({ status: "error", output: stderr });
        }
        return res.status(200).json({ status: "success", output: stdout });
    });
}

// Execute Java code
function executeJavaCode(filePath, res) {
    const className = path.basename(filePath, '.java');
    execFile('javac', [filePath], (error) => {
        if (error) {
            cleanup(filePath);
            return res.status(200).json({ status: "error", output: error.stderr });
        }
        execFile('java', [className], { cwd: TEMP_DIR }, (error, stdout, stderr) => {
            cleanup(filePath);
            cleanup(path.join(TEMP_DIR, `${className}.class`));
            if (error) {
                return res.status(200).json({ status: "error", output: stderr });
            }
            return res.status(200).json({ status: "success", output: stdout });
        });
    });
}

// Execute C code
function executeCCode(filePath, res) {
    execFile('gcc', [filePath, '-o', path.join(TEMP_DIR, `${path.basename(filePath, '.c')}.out`)], (error) => {
        if (error) {
            cleanup(filePath);
            return res.status(200).json({ status: "error", output: error.stderr });
        }
        execFile(path.join(TEMP_DIR, `${path.basename(filePath, '.c')}.out`), (error, stdout, stderr) => {
            cleanup(filePath);
            cleanup(path.join(TEMP_DIR, `${path.basename(filePath, '.c')}.out`));
            if (error) {
                return res.status(200).json({ status: "error", output: stderr });
            }
            return res.status(200).json({ status: "success", output: stdout });
        });
    });
}

// Execute C++ code
function executeCppCode(filePath, res) {
    execFile('g++', [filePath, '-o', path.join(TEMP_DIR, `${path.basename(filePath, '.cpp')}.out`)], (error) => {
        if (error) {
            cleanup(filePath);
            return res.status(200).json({ status: "error", output: error.stderr });
        }
        execFile(path.join(TEMP_DIR, `${path.basename(filePath, '.cpp')}.out`), (error, stdout, stderr) => {
            cleanup(filePath);
            cleanup(path.join(TEMP_DIR, `${path.basename(filePath, '.cpp')}.out`));
            if (error) {
                return res.status(200).json({ status: "error", output: stderr });
            }
            return res.status(200).json({ status: "success", output: stdout });
        });
    });
}

// Cleanup temporary files
function cleanup(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}
