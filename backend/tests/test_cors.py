from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


def _preflight(client: TestClient, origin: str, method: str = "POST"):
    return client.options(
        "/auth/login",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": method,
            "Access-Control-Request-Headers": "content-type,authorization",
        },
    )


def test_cors_preflight_allows_localhost(client: TestClient) -> None:
    response = _preflight(client, "http://localhost:3000")

    assert response.status_code in (200, 204)
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
    assert response.headers.get("access-control-allow-credentials") == "true"


def test_cors_preflight_allows_127_localhost(client: TestClient) -> None:
    response = _preflight(client, "http://127.0.0.1:3000")

    assert response.status_code in (200, 204)
    assert response.headers.get("access-control-allow-origin") == "http://127.0.0.1:3000"
    assert response.headers.get("access-control-allow-credentials") == "true"


def test_cors_preflight_rejects_unknown_origin(client: TestClient) -> None:
    response = _preflight(client, "https://evil.example")

    # Starlette CORSMiddleware returns 400 for disallowed preflight.
    assert response.status_code == 400
    assert response.headers.get("access-control-allow-origin") is None


def test_cors_simple_request_allows_known_origin(client: TestClient) -> None:
    response = client.get("/user/stats", headers={"Origin": "http://localhost:3000"})

    # Endpoint may 401 due to missing auth, but CORS headers should still be present.
    assert response.status_code in (200, 401, 403)
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
