#!/usr/bin/env bash
set -u

GUARD="$(cd "$(dirname "$0")" && pwd)/audit-guard.sh"
FAILURES=0
CHECKS=0
WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

fresh_root() {
  ROOT="$WORKDIR/case-$CHECKS-$RANDOM"
  mkdir -p "$ROOT/scripts" "$ROOT/6a1-back/src/main/java/app/controllers" "$ROOT/6a1-back/src/main/java/app/exception" \
    "$ROOT/6a1-back/src/main/resources" "$ROOT/6a1-front/src/app/feature"
}

write() {
  mkdir -p "$(dirname "$ROOT/$1")"
  printf '%s\n' "$2" > "$ROOT/$1"
}

guard() {
  OUTPUT="$(GUARD_ROOT="$ROOT" GUARD_ALLOW_FILE="$ROOT/scripts/audit-guard.allow" "$GUARD" "$@" 2>&1)"
  STATUS=$?
}

pass() { CHECKS=$((CHECKS + 1)); }

fail() {
  CHECKS=$((CHECKS + 1))
  FAILURES=$((FAILURES + 1))
  echo "FAIL: $1"
  echo "$OUTPUT" | sed 's/^/    /'
}

expect_violation() {
  local description="$1" rule="$2" file="$3"
  guard --all
  if [ "$STATUS" -eq 1 ] && echo "$OUTPUT" | grep -q "^$file:[0-9]*: $rule\$"; then pass; else fail "$description (attendu $rule sur $file)"; fi
}

expect_clean() {
  local description="$1"
  guard --all
  if [ "$STATUS" -eq 0 ]; then pass; else fail "$description (attendu aucune violation)"; fi
}

fresh_root
write 6a1-back/src/main/java/app/controllers/PingController.java '@CrossOrigin(origins = "http://localhost:4200")
class PingController {}'
expect_violation "B-CORS: @CrossOrigin dans un controller" B-CORS 6a1-back/src/main/java/app/controllers/PingController.java

fresh_root
write 6a1-back/src/main/java/app/controllers/PingController.java 'class PingController {}'
expect_clean "controller sans @CrossOrigin"

fresh_root
write 6a1-back/src/main/resources/application.properties 'server.error.include-message=always'
expect_violation "message d'erreur exposé" B-ERROR-MESSAGE-EXPOSED 6a1-back/src/main/resources/application.properties

fresh_root
write 6a1-back/docker-compose.yml '    ports:
      - "5432:5432"'
expect_violation "port Docker sans 127.0.0.1" B-DOCKER-PORT-EXPOSED 6a1-back/docker-compose.yml

fresh_root
write 6a1-back/docker-compose.yml '    ports:
      - "127.0.0.1:5432:5432"'
expect_clean "port Docker limité à localhost"

fresh_root
write 6a1-back/src/main/java/app/exception/BadThing.java '@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadThing extends RuntimeException {}'
expect_violation "@ResponseStatus sur une exception" B-RESPONSE-STATUS 6a1-back/src/main/java/app/exception/BadThing.java

fresh_root
write 6a1-back/src/main/java/app/controllers/Created.java 'class Created {
    @ResponseStatus(HttpStatus.CREATED)
    void create() {}
}'
expect_clean "@ResponseStatus sur une méthode de controller"

fresh_root
write 6a1-back/src/main/java/app/Service.java 'class Service { void run() { System.out.println("x"); } }'
expect_violation "System.out" B-SYSOUT 6a1-back/src/main/java/app/Service.java

fresh_root
write 6a1-back/src/main/java/app/Service.java 'class Service { void run() { error.printStackTrace(); } }'
expect_violation "printStackTrace" B-SYSOUT 6a1-back/src/main/java/app/Service.java

fresh_root
write 6a1-back/src/main/java/app/Dao.java 'class Dao { String q = "SELECT * FROM joueur"; }'
expect_violation "SELECT *" B-SELECT-STAR 6a1-back/src/main/java/app/Dao.java

fresh_root
write 6a1-back/src/main/java/app/Dao.java 'class Dao { String q = "SELECT s.*, j.nom FROM stats s"; }'
expect_violation "s.*" B-SELECT-STAR 6a1-back/src/main/java/app/Dao.java

fresh_root
write 6a1-back/src/main/java/app/Dao.java 'class Dao { String q = "SELECT s.note FROM stats s"; }'
expect_clean "SELECT avec colonnes explicites"

fresh_root
write 6a1-back/src/main/resources/application.properties 'spring.datasource.password=hunter2'
expect_violation "secret en clair dans les propriétés" B-SECRET 6a1-back/src/main/resources/application.properties

fresh_root
write 6a1-back/src/main/resources/application.properties 'spring.datasource.password=${DATABASE_PASSWORD}'
expect_clean "secret lu depuis l'environnement"

fresh_root
write 6a1-back/src/main/java/app/Config.java 'class Config { String password = "hunter2"; }'
expect_violation "secret en clair dans le code" B-SECRET 6a1-back/src/main/java/app/Config.java

fresh_root
write 6a1-back/src/main/java/app/Swallow.java 'class Swallow { void run() { try { x(); } catch (Exception exception) { } } }'
expect_violation "catch (Exception) vide sur une ligne" B-EMPTY-CATCH 6a1-back/src/main/java/app/Swallow.java

fresh_root
write 6a1-back/src/main/java/app/Swallow.java 'class Swallow {
    void run() {
        try {
            x();
        } catch (Exception exception) {
        }
    }
}'
expect_violation "catch (Exception) vide multi-lignes" B-EMPTY-CATCH 6a1-back/src/main/java/app/Swallow.java

fresh_root
write 6a1-back/src/main/java/app/Handled.java 'class Handled {
    void run() {
        try {
            x();
        } catch (Exception exception) {
            log(exception);
        }
    }
}'
expect_clean "catch (Exception) qui traite l'erreur"

fresh_root
write 6a1-back/src/main/java/app/controllers/Api.java 'class Api {
    void create(@RequestBody Payload payload) {}
}'
expect_violation "@RequestBody sans @Valid" B-REQUEST-BODY-WITHOUT-VALID 6a1-back/src/main/java/app/controllers/Api.java

fresh_root
write 6a1-back/src/main/java/app/controllers/Api.java 'class Api {
    void create(@Valid @RequestBody Payload payload) {}
}'
expect_clean "@RequestBody avec @Valid"

fresh_root
write 6a1-back/src/main/java/app/Commented.java '// explication
class Commented {}'
expect_violation "commentaire // Java" NO-COMMENTS 6a1-back/src/main/java/app/Commented.java

fresh_root
write 6a1-back/src/test/java/app/CommentedTest.java '/* bloc */
class CommentedTest {}'
expect_violation "commentaire bloc Java en test" NO-COMMENTS 6a1-back/src/test/java/app/CommentedTest.java

fresh_root
write 6a1-back/src/main/java/app/Url.java 'class Url { String url = "http://example.com"; }'
expect_clean "URL dans une chaîne Java n'est pas un commentaire"

fresh_root
write 6a1-front/src/app/feature/api.ts 'const url = "http://localhost:8080/players"'
expect_violation "URL en dur" F-HARDCODED-URL 6a1-front/src/app/feature/api.ts

fresh_root
write 6a1-front/src/app/feature/api.ts 'const url = "https://api.example.com"'
expect_violation "URL https en dur" F-HARDCODED-URL 6a1-front/src/app/feature/api.ts

fresh_root
write 6a1-front/src/app/feature/typed.ts 'export function f(value: any) { return value }'
expect_violation "type any" F-ANY 6a1-front/src/app/feature/typed.ts

fresh_root
write 6a1-front/src/app/feature/typed.ts 'export const company = "any"
export function f(value: unknown) { return value }'
expect_clean "unknown et chaîne any"

fresh_root
write 6a1-front/src/app/feature/bang.ts 'export const ok = !!value'
expect_violation "double négation" F-DOUBLE-BANG 6a1-front/src/app/feature/bang.ts

fresh_root
write 6a1-front/src/app/feature/leak.component.ts 'import { x } from "y"
service.load().subscribe((value) => console.error(value))'
expect_violation "subscribe sans takeUntilDestroyed" F-SUBSCRIBE-LEAK 6a1-front/src/app/feature/leak.component.ts

fresh_root
write 6a1-front/src/app/feature/safe.component.ts 'service.load().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => value)'
expect_clean "subscribe avec takeUntilDestroyed"

fresh_root
write 6a1-front/src/app/feature/safe.spec.ts 'service.load().subscribe((value) => value)'
expect_clean "subscribe autorisé dans un spec"

fresh_root
write 6a1-front/src/app/feature/mod.ts '@NgModule({})
export class FeatureModule {}'
expect_violation "NgModule" F-NGMODULE 6a1-front/src/app/feature/mod.ts

fresh_root
write 6a1-front/src/app/feature/view.html '<div *ngIf="visible">x</div>'
expect_violation "*ngIf" F-STRUCTURAL-DIRECTIVE 6a1-front/src/app/feature/view.html

fresh_root
write 6a1-front/src/app/feature/view.html '<div *ngFor="let item of items">x</div>'
expect_violation "*ngFor" F-STRUCTURAL-DIRECTIVE 6a1-front/src/app/feature/view.html

fresh_root
write 6a1-front/src/app/feature/view.html '@if (visible) { <div>x</div> }'
expect_clean "control flow moderne"

fresh_root
write 6a1-front/src/app/feature/log.ts 'console.log("debug")'
expect_violation "console.log" F-CONSOLE-LOG 6a1-front/src/app/feature/log.ts

fresh_root
write 6a1-front/src/app/feature/flow.ts 'import { ThingService } from "x"
const flow = source.pipe(switchMap((id) => this.thingService.load(id)))'
expect_violation "switchMap HTTP sans catchError" F-HTTP-FLOW-WITHOUT-CATCH 6a1-front/src/app/feature/flow.ts

fresh_root
write 6a1-front/src/app/feature/flow.ts 'import { ThingService } from "x"
const flow = source.pipe(switchMap((id) => this.thingService.load(id).pipe(catchError(() => of([])))))'
expect_clean "switchMap HTTP avec catchError"

fresh_root
write 6a1-front/src/app/feature/commented.ts 'const value = 1 // explication'
expect_violation "commentaire de fin de ligne TS" NO-COMMENTS 6a1-front/src/app/feature/commented.ts

fresh_root
write 6a1-front/src/app/feature/directive.ts '// @ts-expect-error volontaire
const value: number = "x"'
expect_clean "directive @ts- autorisée"

fresh_root
write 6a1-front/src/app/feature/directive.ts '//NOSONAR
const value = 1'
expect_violation "NOSONAR interdit" NO-COMMENTS 6a1-front/src/app/feature/directive.ts

fresh_root
write 6a1-front/src/app/feature/view.html '<!-- note -->
<p>x</p>'
expect_violation "commentaire HTML" NO-COMMENTS 6a1-front/src/app/feature/view.html

fresh_root
write 6a1-front/src/app/feature/style.scss '/* note */
.a { color: red; }'
expect_violation "commentaire SCSS" NO-COMMENTS 6a1-front/src/app/feature/style.scss

fresh_root
write 6a1-front/src/app/feature/api.ts 'const url = "http://localhost:8080/players"'
write scripts/audit-guard.allow 'F-HARDCODED-URL|6a1-front/src/app/feature/api.ts|fixture de test assumée'
expect_clean "exception justifiée dans le fichier allow"

fresh_root
write 6a1-front/src/app/feature/api.ts 'const url = "http://localhost:8080/players"'
write scripts/audit-guard.allow 'F-HARDCODED-URL|6a1-front/src/app/feature/*|tout le dossier est un exemple'
expect_clean "exception par préfixe"

fresh_root
write 6a1-front/src/app/feature/api.ts 'const url = "http://localhost:8080/players"'
write scripts/audit-guard.allow 'F-HARDCODED-URL|6a1-front/src/app/feature/api.ts|'
guard --all
if [ "$STATUS" -eq 1 ] && echo "$OUTPUT" | grep -q "sans justification"; then pass; else fail "exception sans justification refusée"; fi

fresh_root
write 6a1-front/src/app/feature/api.ts 'const url = "http://localhost:8080/players"'
write scripts/audit-guard.allow 'F-HARDCODED-URL|6a1-front/src/app/feature/api.ts'
guard --all
if [ "$STATUS" -eq 1 ] && echo "$OUTPUT" | grep -q "sans justification"; then pass; else fail "exception sans champ justification refusée"; fi

fresh_root
write 6a1-front/src/app/feature/api.ts 'const url = "http://localhost:8080/players"'
write scripts/audit-guard.allow 'F-ANY|6a1-front/src/app/feature/api.ts|mauvaise règle'
expect_violation "une exception pour une autre règle ne masque pas" F-HARDCODED-URL 6a1-front/src/app/feature/api.ts

fresh_root
write 6a1-front/src/app/feature/ok.ts 'export const value = 1'
write 6a1-front/src/app/feature/bad.ts 'export const bad = !!value'
guard --file "$ROOT/6a1-front/src/app/feature/ok.ts"
if [ "$STATUS" -eq 0 ]; then pass; else fail "--file ne scanne que le fichier demandé"; fi
guard --file 6a1-front/src/app/feature/bad.ts
if [ "$STATUS" -eq 1 ] && echo "$OUTPUT" | grep -q "bad.ts:1: F-DOUBLE-BANG"; then pass; else fail "--file détecte une violation"; fi

fresh_root
(
  cd "$ROOT/6a1-front" && git init -q . && git config user.email t@t && git config user.name t
  mkdir -p src/app/feature && echo 'export const clean = 1' > src/app/feature/committed-bad.ts
  echo 'export const dirty = !!x' > src/app/feature/old.ts
  git add . && git commit -qm init
  echo 'export const dirty = 2' > src/app/feature/old.ts
  echo 'export const fresh = !!y' > src/app/feature/new.ts
)
write 6a1-front/src/app/feature/untouched-bad.ts 'export const untouched = 1'
guard
if [ "$STATUS" -eq 1 ] && echo "$OUTPUT" | grep -q "new.ts:1: F-DOUBLE-BANG"; then pass; else fail "mode par défaut: fichier non suivi inspecté"; fi
(
  cd "$ROOT/6a1-front" && git add . && git commit -qm second
  echo 'export const changed = !!z' > src/app/feature/old.ts
)
guard
if [ "$STATUS" -eq 1 ] && echo "$OUTPUT" | grep -q "old.ts:1: F-DOUBLE-BANG" && ! echo "$OUTPUT" | grep -q "new.ts"; then pass; else fail "mode par défaut: seul le fichier modifié est inspecté"; fi

fresh_root
(
  cd "$ROOT/6a1-front" && git init -q . && git config user.email t@t && git config user.name t
  mkdir -p src/app/feature && echo 'export const ok = 1' > src/app/feature/a.ts
  echo '!!legacy' > src/app/feature/legacy.ts
  git add . && git commit -qm init
)
guard
if [ "$STATUS" -eq 0 ]; then pass; else fail "mode par défaut: le legacy non modifié n'est pas signalé"; fi
guard --all
if [ "$STATUS" -eq 1 ]; then pass; else fail "--all: le legacy est signalé"; fi

echo "$((CHECKS - FAILURES))/$CHECKS vérifications réussies"
[ "$FAILURES" -eq 0 ]
