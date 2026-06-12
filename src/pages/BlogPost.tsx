import { useParams } from 'react-router-dom'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  return (
    <div className="container-apex py-20">
      <h1 className="font-display text-4xl font-bold text-pure-white">Blog Post</h1>
      <p className="mt-4 text-frost">Slug: {slug}</p>
    </div>
  )
}
