#!/usr/bin/env python3
"""Conferência de telas sem login; bloqueia métodos que gravam dados.
Requer Python Playwright e Chromium. Não substitui o teste físico autenticado.
Uso após npm run dev -- --host 127.0.0.1 --port 4176:
  python3 scripts/conferir-telas-publicas.py --url http://127.0.0.1:4176
"""
import asyncio,json,argparse,shutil
from pathlib import Path
from playwright.async_api import async_playwright

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--url',default='http://127.0.0.1:4176')
parser.add_argument('--saida',default='/tmp/vanzeiro-telas-publicas')
args=parser.parse_args()
OUT=Path(args.saida);OUT.mkdir(parents=True,exist_ok=True)
BASE=args.url.rstrip('/')
async def main():
 rows=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  for width,height in [(390,844),(360,740),(375,667)]:
   context=await browser.new_context(viewport={'width':width,'height':height})
   async def block_writes(route):
    if route.request.method not in ('GET','HEAD','OPTIONS'):await route.abort()
    else:await route.continue_()
   await context.route('**/*',block_writes)
   for path in ['/entrar','/criar-conta','/esqueci-senha','/nova-senha','/termos','/privacidade','/vanzeiro','/passageiro']:
    page=await context.new_page();errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    response=await page.goto(BASE+path,wait_until='domcontentloaded',timeout=45000)
    if path in ['/vanzeiro','/passageiro']:
     await page.wait_for_url('**/entrar',timeout=15000)
     await page.get_by_role('button',name='Entrar',exact=True).wait_for(state='visible',timeout=15000)
    else:
     await page.locator('body').wait_for(state='visible')
     await page.wait_for_function("document.body.innerText.trim().length > 10")
     if path in ['/entrar','/criar-conta','/esqueci-senha']:
      await page.locator('input[type=email]').wait_for(state='visible')
     elif path=='/nova-senha':
      await page.locator('input[type=password]').first.wait_for(state='visible')
    overflow=await page.evaluate('document.documentElement.scrollWidth > innerWidth + 1')
    text=await page.locator('body').inner_text()
    row={'route':path,'viewport':f'{width}x{height}','http':response.status if response else None,'url':page.url,'horizontal_overflow':overflow,'page_errors':errors,'has_visible_text':len(text.strip())>10}
    rows.append(row)
    if width==390 and path in ['/entrar','/criar-conta']:await page.screenshot(path=str(OUT/(path.strip('/')+'.png')),full_page=True)
    await page.close()
   await context.close()
  await browser.close()
 (OUT/'results.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
 failed=[r for r in rows if r['http']!=200 or r['horizontal_overflow'] or r['page_errors'] or not r['has_visible_text']]
 print(json.dumps({'checks':len(rows),'failed':failed},ensure_ascii=False))
 if failed:raise SystemExit(1)
asyncio.run(main())
