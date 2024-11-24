import Image from "next/image";
import localFont from "next/font/local";
import {useRouter} from "next/router"


export default function CurrentBlogPage() {
  const router = useRouter();
  const {id} = router.query; // this is the current blog we are on.

  return (

    <div>this is blog {id}
    </div>

  )
} 
