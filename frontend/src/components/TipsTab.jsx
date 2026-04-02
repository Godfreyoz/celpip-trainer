import { C } from './UI'

const TIPS = {
  Listening: [
    { tip:'Preview the questions first', detail:'Before each audio clip plays, quickly read the questions. This tells you exactly what information to listen for, making the task much easier and more focused.' },
    { tip:'Listen for stressed words', detail:'English speakers naturally stress the most important words. Train yourself to notice these — they usually contain the key information needed to answer correctly.' },
    { tip:'Practice with Canadian accents daily', detail:'CELPIP uses Canadian English. Watch CBC News, Canadian YouTube channels, or listen to Canadian podcasts daily to get comfortable with the rhythm and accent.' },
    { tip:"Don't try to write everything down", detail:'Focus on the main idea and key details only. Trying to transcribe every word makes you miss the overall meaning — which is what CELPIP tests.' },
    { tip:'Use process of elimination', detail:'If unsure, eliminate clearly wrong options first. Two options are often very similar — choose the one that matches exactly what was said, not what you assumed.' },
    { tip:'Understand all 6 listening parts', detail:'CELPIP Listening has daily conversations, phone messages, news reports, discussions, and viewpoints. Each needs a slightly different strategy — practice all formats regularly.' },
  ],
  Speaking: [
    { tip:'Use preparation time fully', detail:'CELPIP gives preparation time before each task. Use every second — jot 2-3 key points so you never run out of things to say mid-response.' },
    { tip:"Don't memorise scripts", detail:'Memorised responses sound unnatural and examiners detect them easily. Practice speaking about common topics so your ideas flow naturally and confidently.' },
    { tip:'Fill pauses naturally', detail:"Instead of going silent, use fillers like 'That's an interesting point...' or 'Well, in my experience...' to buy time while you organise your thoughts." },
    { tip:'Match tone to the task', detail:'Some tasks are formal (advising a colleague) and some informal (talking to a friend). Using the wrong register — too casual or too stiff — costs marks.' },
    { tip:'Speak at a steady pace', detail:'Nervousness causes fast speech. Slow down slightly, pause between ideas, and speak clearly. CELPIP rewards clarity and naturalness over speed.' },
    { tip:'Always give specific examples', detail:'Vague answers score lower. Whenever you make a point, immediately follow it with a quick specific example. This demonstrates fluency and convinces the examiner.' },
  ],
}

export default function TipsTab({ section }) {
  const tips = TIPS[section] || []
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ background:'#1a1d27', border:`1px solid ${C.accent}33`, borderRadius:12, padding:14, marginBottom:4 }}>
        <div style={{ color:C.accent, fontSize:12, fontWeight:700, marginBottom:4 }}>
          {section === 'Listening' ? '🎧' : '🗣'} YOUR {section.toUpperCase()} SCORE: 7 (CLB 7)
        </div>
        <div style={{ color:C.muted, fontSize:13 }}>
          {section === 'Listening'
            ? 'Your listening is already at CLB 7. Use these tips to push it to 9+ and boost your CRS score.'
            : 'Your speaking score of 9 is excellent! These tips will help you maintain and improve further.'}
        </div>
      </div>
      {tips.map((t, i) => (
        <div key={i} style={{ background:'#1a1d27', border:`1px solid ${C.border}`, borderLeft:`3px solid ${C.accent}`, borderRadius:12, padding:16 }}>
          <div style={{ color:C.accent, fontWeight:700, marginBottom:6, fontSize:15 }}>{i+1}. {t.tip}</div>
          <div style={{ color:C.muted, fontSize:14, lineHeight:1.65 }}>{t.detail}</div>
        </div>
      ))}
    </div>
  )
}
