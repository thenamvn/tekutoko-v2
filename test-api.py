from google import genai

client = genai.Client(api_key="AIzaSyB-r-8mpfLE6MLMlEd_sUmk0gDH-T4IVX0")

response = client.models.generate_content(
    model="gemini-2.5-flash", contents="hello in japanese is?"
)
print(response.text)