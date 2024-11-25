// pages/api/code/visitor.js

// import executeCode from "../../../execute"; // Assuming execute.js is in the same directory
import executeCode from "../../../utils/executeCode";

export default async function handler(req, res) {
    console.log(res);
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { code, language, stdin = "" } = req.body;

    // Validate input
    if (!code || !language) {
        return res.status(400).json({ message: 'Code and language are required' });
    }

    // Call executeCode with the response object
    await executeCode(code, language, stdin, res);
}
