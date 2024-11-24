import Image from "next/image";
import localFont from "next/font/local";
import {useRouter} from "next/router"


export default async function CurrentBlogPage() {
  const router = useRouter();
  const {id} = router.query; // this is the current blog we are on.

  try {
    const response = await fetch(`/api/blogs/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }});

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const currBlog = await response.json();
      

  } catch(error) {
    
  }

  return (

    <div>this is blog {id}
    </div>

  )
} 
