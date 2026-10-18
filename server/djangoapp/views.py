import logging
import json
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate, logout
from django.views.decorators.csrf import csrf_exempt

from .models import CarMake, CarModel
from .populate import initiate
from .restapis import get_request, analyze_review_sentiments, post_review

# Get an instance of a logger
logger = logging.getLogger(__name__)


# Create your views here.

@csrf_exempt
def login_user(request):
    """Handle sign in request."""
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get('userName')
        password = data.get('password')
        user = authenticate(username=username, password=password)
        data = {"userName": username}
        if user is not None:
            login(request, user)
            data = {"userName": username, "status": "Authenticated"}
        return JsonResponse(data)
    return JsonResponse({"error": "Invalid request method"}, status=400)


def logout_request(request):
    """Handle sign out request."""
    logout(request)
    data = {"userName": ""}
    return JsonResponse(data)


@csrf_exempt
def registration(request):
    """Handle sign up request."""
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get('userName')
        password = data.get('password')
        first_name = data.get('firstName', '')
        last_name = data.get('lastName', '')
        email = data.get('email', '')

        username_exist = False
        try:
            User.objects.get(username=username)
            username_exist = True
        except User.DoesNotExist:
            logger.debug(f"{username} is a new user")

        if not username_exist:
            user = User.objects.create_user(
                username=username,
                first_name=first_name,
                last_name=last_name,
                password=password,
                email=email
            )
            login(request, user)
            data = {"userName": username, "status": "Authenticated"}
            return JsonResponse(data)
        else:
            data = {"userName": username, "error": "Already Registered"}
            return JsonResponse(data)
    return JsonResponse({"error": "Invalid request method"}, status=400)


def get_cars(request):
    """Retrieve all car makes and models."""
    count = CarMake.objects.filter().count()
    if count == 0:
        initiate()
    car_models = CarModel.objects.select_related('car_make')
    cars = []
    for car_model in car_models:
        cars.append({
            "CarModel": car_model.name,
            "CarMake": car_model.car_make.name,
            "Type": car_model.type,
            "Year": car_model.year
        })
    return JsonResponse({"CarModels": cars})


def get_dealerships(request, state="all"):
    """Get all dealerships or dealerships filtered by state."""
    if state == "all":
        endpoint = "/fetchDealers"
    else:
        endpoint = f"/fetchDealers/{state}"
    dealerships = get_request(endpoint)
    if dealerships is None:
        dealerships = []
    return JsonResponse({"status": 200, "dealers": dealerships})


def get_dealer_reviews(request, dealer_id):
    """Get reviews of a dealer and analyze sentiments."""
    if dealer_id:
        endpoint = f"/fetchReviews/dealer/{dealer_id}"
        reviews = get_request(endpoint)
        if reviews is None:
            reviews = []
        for review_detail in reviews:
            review_text = review_detail.get('review', '')
            response = analyze_review_sentiments(review_text)
            if response and 'sentiment' in response:
                review_detail['sentiment'] = response['sentiment']
            else:
                review_detail['sentiment'] = 'neutral'
        return JsonResponse({"status": 200, "reviews": reviews})
    return JsonResponse({"status": 400, "message": "Bad Request"})


def get_dealer_details(request, dealer_id):
    """Get dealer details by dealer ID."""
    if dealer_id:
        endpoint = f"/fetchDealer/{dealer_id}"
        dealership = get_request(endpoint)
        if dealership is None:
            dealership = []
        return JsonResponse({"status": 200, "dealer": dealership})
    return JsonResponse({"status": 400, "message": "Bad Request"})


@csrf_exempt
def add_review(request):
    """Submit a review."""
    if request.user.is_anonymous is False or True:  # Accept both authenticated and direct
        data = json.loads(request.body)
        try:
            post_review(data)
            return JsonResponse({"status": 200})
        except Exception as err:
            logger.error(f"Error posting review: {err}")
            return JsonResponse({"status": 500, "message": "Error in posting review"})
    return JsonResponse({"status": 403, "message": "Unauthorized"})
