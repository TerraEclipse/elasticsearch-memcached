test:
	@./node_modules/.bin/mocha \
		--reporter spec \
		--bail \
		--timeout 5s \

.PHONY: test