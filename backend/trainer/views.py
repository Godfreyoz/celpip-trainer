from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
import anthropic

from .models import PracticeSession
from .serializers import PracticeSessionSerializer


# ── Save Session ──────────────────────────────────────────────────────────────
@api_view(['POST'])
def save_session(request):
    s = PracticeSessionSerializer(data=request.data)
    if s.is_valid():
        session = s.save(user=request.user)
        # Update user's current score for this section
        user = request.user
        field_map = {
            'Reading': 'current_reading',
            'Writing': 'current_writing',
            'Listening': 'current_listening',
            'Speaking': 'current_speaking',
        }
        field = field_map.get(session.section)
        if field:
            setattr(user, field, session.score)
            user.save(update_fields=[field])
        return Response(PracticeSessionSerializer(session).data, status=201)
    return Response(s.errors, status=400)


# ── Get My Sessions ───────────────────────────────────────────────────────────
@api_view(['GET'])
def my_sessions(request):
    sessions = PracticeSession.objects.filter(user=request.user)
    section = request.query_params.get('section')
    if section:
        sessions = sessions.filter(section=section)
    return Response(PracticeSessionSerializer(sessions[:50], many=True).data)


# ── AI: Writing Feedback ──────────────────────────────────────────────────────
@api_view(['POST'])
def ai_writing_feedback(request):
    task = request.data.get('task', '')
    response_text = request.data.get('response', '')
    word_count = request.data.get('word_count', 0)

    if not task or not response_text:
        return Response({'error': 'Task and response are required.'}, status=400)

    try:
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1500,
            system="You are an expert CELPIP examiner. Score and correct the student's writing response. Return ONLY valid JSON.",
            messages=[{
                "role": "user",
                "content": f"""Score this CELPIP Writing Task. Task: "{task}" Response ({word_count} words): "{response_text}"

Return ONLY this JSON:
{{
  "score": <1-10>,
  "spellingErrors": ["misspelled → correct"],
  "grammarErrors": ["error → correction"],
  "informalLanguage": ["informal word → formal alternative"],
  "taskFulfillment": "feedback on how well they addressed the task",
  "structure": "feedback on paragraph structure",
  "vocabulary": "feedback on vocabulary range",
  "strongPoints": "1-2 genuine strengths",
  "correctedVersion": "rewrite with all errors fixed, keeping their ideas",
  "topPriorities": ["top 3 things to improve"]
}}"""
            }]
        )
        import json
        text = message.content[0].text.strip()
        text = text.replace('```json', '').replace('```', '').strip()
        result = json.loads(text)
        return Response(result)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# ── AI: Reading Feedback ──────────────────────────────────────────────────────
@api_view(['POST'])
def ai_reading_feedback(request):
    correct = request.data.get('correct', 0)
    score = request.data.get('score', 0)
    wrong_answers = request.data.get('wrong_answers', [])
    passage_title = request.data.get('passage_title', '')

    try:
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        wrong_text = "\n".join([
            f"Q{w['id']}: \"{w['question']}\" — chose {w['userAns']}, correct was {w['ans']}. Explanation: {w['explanation']}"
            for w in wrong_answers
        ]) if wrong_answers else "All correct!"

        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=800,
            system="You are a CELPIP coach. Give specific, actionable reading feedback.",
            messages=[{
                "role": "user",
                "content": f"""CELPIP Reading result: {correct}/5 correct. Score ~{score}. Passage: "{passage_title}"
Wrong answers:
{wrong_text}

Give feedback in this format:
SCORE SUMMARY: (1 sentence)

WHAT YOU GOT WRONG: (explain each wrong answer — why the correct answer is right, what clue was in the passage)

KEY SKILLS TO IMPROVE: (2-3 specific reading strategies)

WELL DONE: (1 sentence on what they did right)"""
            }]
        )
        return Response({'feedback': message.content[0].text.strip()})
    except Exception as e:
        return Response({'feedback': f"Good effort! Review the answer explanations for each question. Error: {str(e)}"})


# ── AI: Improvement Task ──────────────────────────────────────────────────────
@api_view(['POST'])
def ai_improvement_task(request):
    area = request.data.get('area', 'Writing')
    weak_points = request.data.get('weak_points', '')

    try:
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,
            system="You are a CELPIP coach. Create short, focused improvement exercises.",
            messages=[{
                "role": "user",
                "content": f"Create one CELPIP {area} improvement task targeting: {weak_points}. Keep it under 3 sentences. Plain text only."
            }]
        )
        return Response({'task': message.content[0].text.strip()})
    except Exception as e:
        return Response({'task': f'Practice writing 3 sentences using formal language, avoiding contractions and slang.'})


# ── AI: Submit Improvement Task ───────────────────────────────────────────────
@api_view(['POST'])
def ai_check_improvement(request):
    area = request.data.get('area', '')
    task = request.data.get('task', '')
    response_text = request.data.get('response', '')

    try:
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=400,
            system="You are a CELPIP coach. Give short, specific correction and encouragement.",
            messages=[{
                "role": "user",
                "content": f"CELPIP {area} improvement task: \"{task}\"\nStudent response: \"{response_text}\"\nGive specific correction in 3-5 sentences."
            }]
        )
        return Response({'feedback': message.content[0].text.strip()})
    except Exception as e:
        return Response({'feedback': 'Great effort! Focus on formal language and clear sentence structure.'})
