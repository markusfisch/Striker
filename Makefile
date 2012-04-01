OBJECTS = css \
	js \
	*.html .ht* *.ico
PRODUCTION = hhsw.de@ssh.strato.de:sites/striker/
PROTO = hhsw.de@ssh.strato.de:sites/proto/striker/
OPTIONS = --exclude=src \
	--recursive \
	--links \
	--update \
	--delete-after \
	--times \
	--compress

production: compress compile
	rsync $(OPTIONS) \
		--exclude="css/src" \
		$(OBJECTS) \
		$(PRODUCTION)

proto: compress compile
	rsync $(OPTIONS) \
		--exclude="css/src" \
		$(OBJECTS) \
		$(PROTO)

compress:
	@if ! [ -f js/compressed.js ] || \
		[ "`find js/ -newer js/compressed.js`" ]; then \
		echo "compressing java script files"; \
		cat js/src/StrikerImageList.js \
			js/src/StrikerObject.js \
			js/src/Striker.js \
			js/src/App.js | jspack > js/compressed.js; \
	fi
	@if ! [ -f css/compressed.css ] || \
		[ "`find css/src/ -newer css/compressed.css`" ]; then \
		echo "compressing style sheets"; \
		cat css/src/Briefing.css \
			css/src/body.css | csspack > css/compressed.css; \
	fi

compile:
	@if ! [ -f index.html ] || \
		[ "`find css -newer index.html`" ] || \
		[ "`find js -newer index.html`" ] || \
		[ "`find src -newer index.html`" ]; then \
		echo "compiling html"; \
		rm -f index.html; \
		cat src/index.html | while read LINE; \
		do \
			case "$$LINE" in \
				^*) \
					cat $${LINE#*^} \
					;; \
				*) \
					echo $$LINE \
					;; \
			esac \
		done >> index.html; \
	fi
