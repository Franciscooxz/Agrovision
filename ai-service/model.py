import random

def analyze_crop(data):
    predictions = ["Saludable", "Estrés hídrico", "Posible plaga", "Deficiencia de nutrientes"]

    prediction = random.choice(predictions)

    recommendations = {
        "Saludable": "Mantener monitoreo semanal.",
        "Estrés hídrico": "Aumentar riego progresivamente.",
        "Posible plaga": "Aplicar control biológico.",
        "Deficiencia de nutrientes": "Aplicar fertilizante NPK."
    }

    return {
        "prediction": prediction,
        "confidence": round(random.uniform(0.75, 0.95), 2),
        "recommendation": recommendations[prediction]
    }
