from google import genai

client = genai.Client(api_key="AIzaSyBxHdpea8l3qjgOU7dRAyo0cuPYRiHVnzE")

response = client.models.generate_content(
    model="gemini-2.5-flash", contents="hello in japanese is?"
)
print(response.text)