lint:
	black --check .
	flake8 .

black:
	black .

test:
	pytest tests/

test-coverage:
	pytest --cov=apps tests/

test-coverage-report:
	pytest --cov=apps --cov-report html tests/
