// 'use client'

// import { useState } from 'react'
// import { Memory, GrandparentProfile } from '@/lib/supabase'
// import { BookOpen, User, Calendar, MessageCircle } from 'lucide-react'

// // Demo data for testing the frontend
// const demoGrandparents: GrandparentProfile[] = [
//   {
//     id: '1',
//     whatsapp_number: '1234567890',
//     name: 'Grandma Rose',
//     metadata: { first_message: '2024-01-01' },
//     created_at: '2024-01-01T00:00:00Z',
//     updated_at: '2024-01-01T00:00:00Z'
//   },
//   {
//     id: '2',
//     whatsapp_number: '0987654321',
//     name: 'Grandpa John',
//     metadata: { first_message: '2024-01-02' },
//     created_at: '2024-01-02T00:00:00Z',
//     updated_at: '2024-01-02T00:00:00Z'
//   }
// ]

// const demoMemories: Memory[] = [
//   {
//     id: '1',
//     grandparent_id: '1',
//     title: 'My First Day at School',
//     content: 'I remember my first day at school like it was yesterday. I was so nervous, but my mother held my hand and told me everything would be okay. The teacher was kind and helped me find my seat. I made friends with a girl named Sarah who sat next to me.',
//     memory_type: 'story',
//     status: 'published',
//     source_conversation_ids: ['conv1', 'conv2'],
//     published_at: '2024-01-15T10:00:00Z',
//     created_at: '2024-01-15T10:00:00Z',
//     updated_at: '2024-01-15T10:00:00Z',
//     grandparent: demoGrandparents[0]
//   },
//   {
//     id: '2',
//     grandparent_id: '2',
//     title: 'The Day I Met Grandma',
//     content: 'It was a sunny day in 1965 when I first met your grandmother. She was working at the local library, and I was there to return a book. She smiled at me, and I knew right then that she was the one. We talked for hours that day, and the rest is history.',
//     memory_type: 'story',
//     status: 'published',
//     source_conversation_ids: ['conv3', 'conv4', 'conv5'],
//     published_at: '2024-01-20T14:30:00Z',
//     created_at: '2024-01-20T14:30:00Z',
//     updated_at: '2024-01-20T14:30:00Z',
//     grandparent: demoGrandparents[1]
//   },
//   {
//     id: '3',
//     grandparent_id: '1',
//     title: 'Family Recipe Secrets',
//     content: 'My grandmother taught me how to make her famous apple pie. The secret was in the crust - she always said to keep the butter cold and handle it as little as possible. I still use her recipe today, and it brings back so many wonderful memories.',
//     memory_type: 'story',
//     status: 'published',
//     source_conversation_ids: ['conv6'],
//     published_at: '2024-01-25T09:15:00Z',
//     created_at: '2024-01-25T09:15:00Z',
//     updated_at: '2024-01-25T09:15:00Z',
//     grandparent: demoGrandparents[0]
//   }
// ]

// export default function DemoMode() {
//   const [showDemo, setShowDemo] = useState(false)

//   if (!showDemo) {
//     return (
//       <div className="fixed bottom-4 right-4 z-50">
//         <button
//           onClick={() => setShowDemo(true)}
//           className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
//         >
//           🎭 Demo Mode
//         </button>
//       </div>
//     )
//   }

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded max-w-4xl w-full max-h-[90vh] overflow-hidden">
//         <div className="p-6 border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             <h2 className="text-xl font-bold text-gray-900">Demo Mode</h2>
//             <button
//               onClick={() => setShowDemo(false)}
//               className="p-2 hover:bg-gray-100 rounded transition-colors"
//             >
//               ✕
//             </button>
//           </div>
//         </div>
        
//         <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
//             <div className="mb-6">
//               <p className="text-gray-600 mb-4 text-sm">
//                 This is demo data to show how the Memory Keeper frontend works. 
//                 In a real setup, this data would come from your Supabase database.
//               </p>
              
//               <div className="bg-blue-50 p-4 rounded-lg mb-4">
//                 <h3 className="font-semibold text-blue-900 mb-2">✨ New Feature: Resizable Layout</h3>
//                 <p className="text-blue-800 text-sm">
//                   The main dashboard now features a resizable layout! You can drag the handle between 
//                   the stats panel and memories grid to adjust the layout to your preference.
//                 </p>
//               </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//               <div className="bg-blue-50 p-4 rounded-lg">
//                 <h3 className="font-semibold text-blue-900 mb-2">Grandparents</h3>
//                 {demoGrandparents.map((gp) => (
//                   <div key={gp.id} className="flex items-center text-blue-800 text-sm">
//                     <User className="h-4 w-4 mr-2" />
//                     {gp.name}
//                   </div>
//                 ))}
//               </div>
              
//               <div className="bg-green-50 p-4 rounded-lg">
//                 <h3 className="font-semibold text-green-900 mb-2">Memories</h3>
//                 <div className="text-green-800 text-sm">
//                   <div className="flex items-center mb-1">
//                     <BookOpen className="h-4 w-4 mr-2" />
//                     {demoMemories.length} published stories
//                   </div>
//                   <div className="flex items-center">
//                     <MessageCircle className="h-4 w-4 mr-2" />
//                     Multi-part conversations
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold text-gray-900">Sample Memories:</h3>
//             {demoMemories.map((memory) => (
//               <div key={memory.id} className="border rounded-lg p-4">
//                 <div className="flex items-center justify-between mb-2">
//                   <h4 className="font-semibold text-gray-900">{memory.title}</h4>
//                   <span className="text-sm text-gray-500">
//                     By {memory.grandparent?.name}
//                   </span>
//                 </div>
//                 <p className="text-gray-600 text-sm">{memory.content}</p>
//                 <div className="flex items-center mt-2 text-xs text-gray-500">
//                   <Calendar className="h-3 w-3 mr-1" />
//                   {new Date(memory.published_at || memory.created_at).toLocaleDateString()}
//                   <MessageCircle className="h-3 w-3 ml-4 mr-1" />
//                   {memory.source_conversation_ids.length} parts
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
        
//         <div className="p-6 border-t border-gray-200 bg-gray-50">
//           <div className="flex items-center justify-between">
//             <p className="text-sm text-gray-600">
//               To use with real data, configure your Supabase connection in .env.local
//             </p>
//             <button
//               onClick={() => setShowDemo(false)}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Close Demo
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
