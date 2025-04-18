from flask import jsonify

def missing_keys(*keys: str):
    """
    Returns a 400 error with a message indicating that a required key is missing.
    """
    return jsonify({'error': f"Missing {', '.join(map(lambda x: f"'{x}'", keys))} key{'s' if len(keys) > 1 else ''}."}), 400
  
def not_found_or_no_permission(entity: str, action: str, user_role: str):
    """
    Returns a 404 error with a message indicating that the entity was not found or the user does not have permission.
    """
    return jsonify({"error": f"{entity} not found or you do not have permission to {action} it as a {user_role}."}), 404