from django.http import HttpResponse

a = 1
# Create your views here.
def myRoute(request):
    global a
    a += 1
    return HttpResponse(f"a={a}")
    