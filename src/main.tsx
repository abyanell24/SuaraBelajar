import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import Wave1App from './wave1/Wave1App'
import './index.css'
import { Toaster } from 'sonner'
import { initializeP2PNode } from './lib/p2p/node'

// Make P2P test available globally for debugging
;(window as any).testWiggleP2P = async () => {
  console.log('🚀 Testing Wiggle P2P functionality...')
  try {
    const node = await initializeP2PNode()
    console.log('✅ P2P node created successfully!')
    console.log('📍 Peer ID:', node.peerId.toString())
    console.log('📊 Node status:', node.status)
    console.log('🔧 Available services:', Object.keys(node.services))
    
    // Test pubsub
    const testTopic = 'wiggle-test'
    console.log(`📡 Testing pubsub on topic: ${testTopic}`)
    
    // Subscribe to test topic
    await node.services.pubsub.subscribe(testTopic)
    console.log('✅ Subscribed to test topic')
    
    // Add listener for messages
    node.services.pubsub.addEventListener('message', (evt: any) => {
      console.log('📨 Received message:', evt.detail)
    })
    
    // Publish a test message
    setTimeout(async () => {
      try {
        const message = new TextEncoder().encode(JSON.stringify({
          type: 'test',
          content: 'Hello from SuaraBelajar!',
          timestamp: Date.now()
        }))
        await node.services.pubsub.publish(testTopic, message)
        console.log('✅ Test message published')
      } catch (err) {
        console.error('❌ Failed to publish message:', err)
      }
    }, 1000)
    
    // Return node for further testing
    ;(window as any).wiggleNode = node
    return node
    
  } catch (error) {
    console.error('❌ P2P test failed:', error)
    throw error
  }
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
const wave1Mode = location.pathname.startsWith('/wave1') || new URLSearchParams(window.location.search).get('wave1') === 'true'
const AppToRender = wave1Mode ? Wave1App : App
root.render(
  React.createElement(React.StrictMode, null,
    React.createElement(AppToRender),
    React.createElement(Toaster, {
      position: "top-right",
      richColors: true,
      closeButton: true,
      duration: 4000
    })
  )
)
