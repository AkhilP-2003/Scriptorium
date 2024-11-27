// // components/TemplateDetail/index.tsx
// import { useRouter } from 'next/router';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

// type Code = {
//   id: number;
//   code: string;
//   language: string;
// };

// type Template = {
//   id: number;
//   title: string;
//   explanation: string;
//   tags: string;
//   owner: {
//     id: number;
//     userName: string;
//   };
//   code: Code | null;
// };

// type TemplateDetailProps = {
//   template: Template;
// };

// const TemplateDetail: React.FC<TemplateDetailProps> = ({ template }) => {
//   const router = useRouter();

//   const handleForkTemplate = () => {
//     const accessToken = localStorage.getItem('accessToken');
//     if (!accessToken) {
//       console.error('No access token found');
//       router.push('/login');
//       return;
//     }

//     try {
//       const decodedToken = JSON.parse(atob(accessToken.split('.')[1])); // decode JWT token
//       const currentTime = Math.floor(Date.now() / 1000);

//       if (decodedToken.exp && decodedToken.exp < currentTime) {
//         console.warn('Token expired. Redirecting to login.');
//         router.push('/login');
//         return;
//       }

//       if (template?.code) {
//         router.push({
//           pathname: '/templates/new',
//           query: {
//             title: `Forked from: ${template.title}`,
//             explanation: template.explanation,
//             tags: `Forked from ${template.owner.userName}`,
//             code: template.code.code,
//             language: template.code.language,
//             parentTemplateId: template.id,
//             ownerName: template.owner.userName,
//           },
//         });
//       } else {
//         console.error('No code found for this template');
//       }
//     } catch (error) {
//       console.error('Error decoding token:', error);
//       router.push('/login');
//     }
//   };

//   const handleRunTemplate = () => {
//     if (template?.code) {
//       router.push({
//         pathname: '/editor',
//         query: {
//           code: template.code.code,
//           language: template.code.language,
//         },
//       });
//     } else {
//       console.error('No code found for this template');
//     }
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-4">Currently Viewing Code Template: {template.title}</h1>
//       <p className="text-gray-600 mb-4">Author: {template.owner.userName}</p>

//       <div className="border p-4 rounded shadow mb-4">
//         <p className="mb-2 text-lg">{template.explanation}</p>
//         <p className="text-sm text-gray-600">Tags: {template.tags}</p>
//       </div>

//       {template.code && (
//         <div className="border p-6 rounded shadow mb-6 bg-gray-100">
//           <h3 className="text-2xl font-semibold mb-4">Code:</h3>
//           <SyntaxHighlighter language={template.code.language} style={oneDark}>
//             {template.code.code}
//           </SyntaxHighlighter>
//           <p className="text-sm text-gray-600 mt-4">Language: {template.code.language}</p>
//         </div>
//       )}

//       {/* Buttons for navigation */}
//       <button
//         className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//         onClick={() => router.back()}
//       >
//         Back
//       </button>

//       <button
//         className="mt-4 ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
//         onClick={handleRunTemplate}
//       >
//         Run
//       </button>

//       <button
//         className="mt-4 ml-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
//         onClick={handleForkTemplate}
//       >
//         Fork & Modify
//       </button>
//     </div>
//   );
// };

// export default TemplateDetail;
