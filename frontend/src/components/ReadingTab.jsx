import { useState, useCallback } from 'react'
import { C, ScoreRing, Spinner } from './UI'
import API from '../api'

const READING_BANK = [
  { id:1, title:"Public Transit Expansion", passage:`Canada's public transit system has undergone significant changes in recent years. Major cities like Toronto, Vancouver, and Montreal have invested heavily in expanding their subway and light rail networks to reduce traffic congestion and carbon emissions. The Toronto Transit Commission recently announced plans to add three new subway lines by 2030, which would serve an additional 500,000 daily commuters. City planners argue that public transit reduces the number of cars on the road, which lowers pollution levels and improves air quality. However, critics point out that construction costs are extremely high and that service disruptions during building phases frustrate existing passengers. Some residents living near proposed construction sites have raised concerns about noise and property values. Despite these challenges, surveys show that 72% of Canadians support increased investment in public transit, especially as fuel prices continue to rise. Many commuters who currently drive to work say they would switch to transit if service were more frequent and reliable. Environmental groups emphasize that expanding public transit is one of the most effective ways to reduce greenhouse gas emissions in urban areas.`, questions:[{id:1,q:"What is the main purpose of this passage?",opts:["A) To criticize Canada's transit system","B) To discuss transit expansion and its effects","C) To explain how subways are built","D) To compare Toronto and Vancouver"],ans:"B",explanation:"The passage presents both sides of transit expansion — benefits and challenges — making B the correct answer. It is not purely critical (A), not technical about construction (C), and does not compare cities (D)."},{id:2,q:"According to the passage, what percentage of Canadians support more transit investment?",opts:["A) 50%","B) 65%","C) 72%","D) 80%"],ans:"C",explanation:"The passage clearly states '72% of Canadians support increased investment in public transit.' Always look for specific numbers mentioned directly in the text."},{id:3,q:"Which word is closest in meaning to 'congestion' as used in the passage?",opts:["A) Pollution","B) Overcrowding","C) Construction","D) Commuting"],ans:"B",explanation:"'Traffic congestion' means too many vehicles causing slow movement — essentially overcrowding on roads. Always read the surrounding sentence for context clues."},{id:4,q:"What do critics of transit expansion mainly argue?",opts:["A) Transit is bad for the environment","B) Construction is too expensive and disruptive","C) Canadians prefer driving","D) Subway lines are already too long"],ans:"B",explanation:"The passage says 'critics point out that construction costs are extremely high and that service disruptions... frustrate existing passengers.' This matches B exactly."},{id:5,q:"What would make current drivers switch to transit?",opts:["A) Lower car prices","B) More parking spaces","C) More frequent and reliable service","D) Cheaper fuel"],ans:"C",explanation:"The passage states commuters 'would switch to transit if service were more frequent and reliable.' This is directly stated — C is correct."}] },
  { id:2, title:"Remote Work in Canada", passage:`Remote work has become a permanent feature of the Canadian workforce following the pandemic. A recent Statistics Canada report found that approximately 40% of employed Canadians now work from home at least part of the time. Technology companies have led this shift, with many announcing that employees can work remotely indefinitely. The benefits are widely acknowledged: workers save time and money on commuting, report better work-life balance, and often experience increased productivity. Employers benefit from lower office costs and access to a wider talent pool since they can hire from anywhere in the country. However, the transition has not been smooth for everyone. Some employees report feeling isolated and disconnected from their colleagues. Younger workers, in particular, say they miss the mentorship opportunities that come from working alongside experienced colleagues in person. There are also concerns about the blurring of boundaries between work and personal life, with some employees finding it difficult to stop working at the end of the day. Managers have had to adapt their leadership styles significantly to maintain team cohesion and productivity across distributed teams.`, questions:[{id:1,q:"What is the writer's overall attitude toward remote work?",opts:["A) Strongly positive","B) Strongly negative","C) Balanced, showing both benefits and drawbacks","D) Neutral with no clear opinion"],ans:"C",explanation:"The passage presents benefits AND drawbacks. A balanced passage that shows both sides = C."},{id:2,q:"What percentage of Canadians work from home at least part of the time?",opts:["A) 20%","B) 30%","C) 40%","D) 50%"],ans:"C",explanation:"'Approximately 40% of employed Canadians now work from home at least part of the time' — directly stated."},{id:3,q:"Which group is most likely to miss in-person work?",opts:["A) Technology workers","B) Younger employees","C) Managers","D) Urban commuters"],ans:"B",explanation:"'Younger workers, in particular, say they miss the mentorship opportunities.' The phrase 'in particular' signals emphasis."},{id:4,q:"What does 'distributed teams' mean in this passage?",opts:["A) Teams that share work equally","B) Teams working in different locations","C) Teams that have been split up","D) Teams with different skill sets"],ans:"B",explanation:"'Distributed teams' appears after discussion of remote work where people work from different places. Use surrounding sentences to decode unfamiliar phrases."},{id:5,q:"Which is NOT listed as a benefit of remote work?",opts:["A) Saving commuting costs","B) Better work-life balance","C) Stronger team relationships","D) Access to wider talent pool"],ans:"C",explanation:"The passage actually says remote workers feel MORE isolated — so stronger team relationships is not a benefit listed. 'NOT' questions require you to find what is absent or contradicted."}] },
  { id:3, title:"Food Bank Demand", passage:`Food banks across Canada are experiencing unprecedented demand, with usage increasing by over 30% compared to pre-pandemic levels. Organizations like Food Banks Canada report that over one million Canadians visit a food bank each month. Rising grocery prices, driven by inflation and supply chain disruptions, have pushed many working families to seek assistance for the first time. Contrary to the common assumption that food bank users are unemployed, studies show that nearly half of all recipients are employed but still cannot afford adequate nutrition. Single-parent households and seniors on fixed incomes are disproportionately represented among food bank visitors. Volunteers and staff note that demand typically surges in January after holiday spending and again in September when school costs rise. Donations, however, have not kept pace with growing needs, creating significant pressure on food bank operations. Some community advocates argue that food banks are a temporary solution to a systemic problem rooted in inadequate wages and housing costs.`, questions:[{id:1,q:"What has happened to food bank usage compared to pre-pandemic times?",opts:["A) It has stayed the same","B) It has decreased slightly","C) It has increased by over 30%","D) It has doubled"],ans:"C",explanation:"'Usage increasing by over 30% compared to pre-pandemic levels' — stated directly in the opening sentence."},{id:2,q:"Which assumption about food bank users does the passage challenge?",opts:["A) That they are mostly seniors","B) That they are unemployed","C) That they live in cities","D) That they are recent immigrants"],ans:"B",explanation:"'Contrary to the common assumption that food bank users are unemployed' — the word 'contrary' signals the passage is challenging this assumption."},{id:3,q:"When does demand for food banks increase in September?",opts:["A) Because of cold weather","B) Due to school-related costs","C) Because of job losses","D) After summer holidays"],ans:"B",explanation:"'In September when school costs rise.' School costs = school-related costs. Only B matches what is actually written."},{id:4,q:"What do community advocates suggest as a long-term solution?",opts:["A) Building more food banks","B) Encouraging more donations","C) Policy changes like higher wages","D) Expanding volunteer programs"],ans:"C",explanation:"'They call for policy changes including higher minimum wages.' Building more food banks (A) is the opposite — advocates say food banks are only a temporary fix."},{id:5,q:"What is the main idea of the final sentence?",opts:["A) Food banks are closing down","B) Food banks solve all food problems","C) Deeper economic changes are needed beyond food banks","D) Food banks need more volunteers"],ans:"C",explanation:"'Addressing food insecurity ultimately requires broader economic changes' — the word 'ultimately' signals the main conclusion."}] },
]

function ImprovementTask({ task, onDone }) {
  const [resp, setResp] = useState('')
  const [fb, setFb] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async () => {
    setLoading(true)
    try {
      const { data } = await API.post('/trainer/ai/check-improvement/', { area:'Reading', task, response: resp })
      setFb(data.feedback); setDone(true)
    } catch { setFb('Good effort! Focus on finding key words in the passage before answering.'); setDone(true) }
    setLoading(false)
  }

  return (
    <div style={{ background:C.card, border:`1px solid ${C.purple}44`, borderRadius:12, padding:16, marginTop:14 }}>
      <div style={{ color:C.purple, fontSize:11, fontWeight:700, letterSpacing:2, marginBottom:8 }}>🎯 IMPROVEMENT TASK</div>
      <div style={{ color:C.text, fontSize:14, lineHeight:1.7, marginBottom:12 }}>{task}</div>
      {!done ? (
        <>
          <textarea value={resp} onChange={e => setResp(e.target.value)} placeholder="Your answer..." style={{ width:'100%', minHeight:80, background:'#0f1117', border:`1px solid ${C.border}`, borderRadius:8, padding:12, color:C.text, fontSize:14, resize:'vertical', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}/>
          <button onClick={submit} disabled={loading || resp.length < 10} style={{ marginTop:8, padding:'8px 20px', background:C.purple, color:'#fff', border:'none', borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:13, opacity:resp.length<10?0.5:1 }}>
            {loading ? 'Checking...' : 'Submit'}
          </button>
        </>
      ) : (
        <div>
          <div style={{ background:C.purple+'11', borderRadius:8, padding:12, fontSize:14, color:C.text, lineHeight:1.7 }}>{fb}</div>
          <button onClick={onDone} style={{ marginTop:10, padding:'6px 16px', background:'transparent', border:`1px solid ${C.purple}`, color:C.purple, borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:13 }}>✓ Done</button>
        </div>
      )}
    </div>
  )
}

export default function ReadingTab({ onScore }) {
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [loadingFb, setLoadingFb] = useState(false)
  const [improvTask, setImprovTask] = useState(null)
  const [showImprov, setShowImprov] = useState(false)

  const task = READING_BANK[idx]
  const allAnswered = Object.keys(answers).length === task.questions.length

  const next = () => { setIdx(i => (i+1) % READING_BANK.length); setAnswers({}); setSubmitted(false); setScore(null); setFeedback(''); setImprovTask(null); setShowImprov(false) }

  const submit = async () => {
    let correct = 0
    const wrong = []
    task.questions.forEach(q => {
      if (answers[q.id] === q.ans) correct++
      else wrong.push({ id:q.id, question:q.q, userAns:answers[q.id], ans:q.ans, explanation:q.explanation })
    })
    const map = {0:3,1:4,2:5,3:6,4:8,5:10}
    const s = map[correct] ?? 3
    setScore({ correct, celpip:s }); setSubmitted(true)
    onScore(s, 'Reading', { task_title: task.title })
    setLoadingFb(true)
    try {
      const { data } = await API.post('/trainer/ai/reading-feedback/', { correct, score:s, wrong_answers:wrong, passage_title:task.title })
      setFeedback(data.feedback)
      if (s < 8 && wrong.length > 0) {
        const { data:it } = await API.post('/trainer/ai/improvement-task/', { area:'Reading', weak_points: wrong.map(w=>w.question).join('; ') })
        setImprovTask(it.task)
      }
    } catch { setFeedback('Great effort! Review the answer explanations for each question below.') }
    setLoadingFb(false)
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ color:C.muted, fontSize:12 }}>Passage {idx+1}/{READING_BANK.length} — {task.title}</div>
        {!submitted && <button onClick={next} style={{ background:'transparent', border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, padding:'4px 12px', fontSize:12, cursor:'pointer' }}>Skip →</button>}
      </div>
      <div style={{ background:'#0f1117', border:`1px solid ${C.border}`, borderRadius:12, padding:16, marginBottom:16, lineHeight:1.9, fontSize:14 }}>
        <div style={{ color:C.accent, fontSize:10, fontWeight:700, letterSpacing:2, marginBottom:10 }}>PASSAGE</div>
        {task.passage}
      </div>
      {task.questions.map((q, qi) => {
        const isRight = submitted && answers[q.id] === q.ans
        const isWrong = submitted && answers[q.id] !== q.ans
        return (
          <div key={q.id} style={{ background:isRight?'#10b98108':isWrong?'#ef444408':C.card, border:`1px solid ${isRight?C.green:isWrong?C.red:C.border}`, borderRadius:12, padding:14, marginBottom:12 }}>
            <div style={{ fontWeight:600, marginBottom:10, color:C.text, fontSize:14 }}>{qi+1}. {q.q}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              {q.opts.map(opt => {
                const letter = opt[0], sel = answers[q.id]===letter, correct = letter===q.ans
                return (
                  <button key={letter} onClick={() => !submitted && setAnswers(a=>({...a,[q.id]:letter}))} style={{
                    background:submitted&&correct?'#10b98120':submitted&&sel&&!correct?'#ef444420':sel?C.accent+'20':'transparent',
                    border:`1px solid ${submitted&&correct?C.green:submitted&&sel&&!correct?C.red:sel?C.accent:C.border}`,
                    borderRadius:8, padding:'9px 14px', textAlign:'left',
                    color:submitted&&correct?C.green:submitted&&sel&&!correct?C.red:sel?C.accent:C.muted,
                    cursor:submitted?'default':'pointer', fontSize:14,
                  }}>{opt}{submitted&&correct?' ✓':''}</button>
                )
              })}
            </div>
            {submitted && <div style={{ marginTop:10, padding:10, background:'#0f1117', borderRadius:8, fontSize:13, color:C.muted, lineHeight:1.6 }}><span style={{ color:isRight?C.green:C.red, fontWeight:700 }}>{isRight?'✓ Correct! ':'✗ Incorrect. '}</span>{q.explanation}</div>}
          </div>
        )
      })}
      {!submitted ? (
        <button onClick={submit} disabled={!allAnswered} style={{ width:'100%', padding:14, background:C.accent, color:'#000', border:'none', borderRadius:10, fontWeight:800, fontSize:16, cursor:allAnswered?'pointer':'not-allowed', opacity:allAnswered?1:0.45 }}>
          Submit Answers ({Object.keys(answers).length}/5)
        </button>
      ) : (
        <div>
          <div style={{ background:C.card, border:`1px solid ${C.accent}44`, borderRadius:12, padding:18, marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:12 }}>
              <ScoreRing score={score.celpip} max={10} />
              <div>
                <div style={{ color:C.accent, fontWeight:800, fontSize:20 }}>CELPIP ~{score.celpip}</div>
                <div style={{ color:C.muted, fontSize:13 }}>{score.correct}/5 correct · {score.celpip>=7?'On track ✅':'Needs work 📚'}</div>
              </div>
            </div>
          </div>
          {loadingFb ? <Spinner label="AI is analysing your answers..." /> : feedback && (
            <div style={{ background:C.card, border:`1px solid ${C.accent}44`, borderRadius:12, padding:18, marginBottom:14 }}>
              <div style={{ color:C.accent, fontSize:11, fontWeight:700, letterSpacing:2, marginBottom:10 }}>🤖 AI COACH FEEDBACK</div>
              <div style={{ color:C.text, fontSize:14, lineHeight:1.85, whiteSpace:'pre-wrap' }}>{feedback}</div>
            </div>
          )}
          {improvTask && !showImprov && <button onClick={() => setShowImprov(true)} style={{ width:'100%', marginBottom:12, padding:12, background:C.purple+'22', border:`1px solid ${C.purple}44`, color:C.purple, borderRadius:10, fontWeight:700, cursor:'pointer', fontSize:14 }}>🎯 Get Improvement Task</button>}
          {showImprov && improvTask && <ImprovementTask task={improvTask} onDone={() => { setShowImprov(false); setImprovTask(null) }} />}
          <button onClick={next} style={{ width:'100%', marginTop:12, padding:12, background:'transparent', border:`1px solid ${C.accent}`, color:C.accent, borderRadius:10, fontWeight:700, cursor:'pointer', fontSize:15 }}>🔄 Next Reading Task</button>
        </div>
      )}
    </div>
  )
}
