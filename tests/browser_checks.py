"""Optional reproducible isolated-browser checks.
Requires Python, playwright, beautifulsoup4 and an installed Chromium.
This renderer does not make any real provider calls or claim live deployment coverage.
Run after npm run build:local: python tests/browser_checks.py
"""
import os,shutil
from playwright.sync_api import expect
from playwright.sync_api import sync_playwright
from pathlib import Path
from bs4 import BeautifulSoup
import base64,json
root=Path(__file__).resolve().parents[1]
def document(page='index',javascript=True):
 s=BeautifulSoup((root/'dist'/f'{page}.html').read_text(),'html.parser')
 for link in s.find_all('link'):
  if link.get('rel')==['stylesheet']:
   el=s.new_tag('style');el.string=(root/'dist'/link['href'].lstrip('/')).read_text();link.replace_with(el)
  elif link.get('href','').startswith(('assets/','/assets/')):link.decompose()
 for script in s.find_all('script',src=True):
  code=(root/'dist'/script['src'].lstrip('/')).read_text();script.decompose()
  if javascript:
   el=s.new_tag('script');el.string=code;s.body.append(el)
 for img in s.find_all('img',src=True):
  path=root/'dist'/img['src'].lstrip('/')
  mime='image/svg+xml' if path.suffix=='.svg' else 'image/webp' if path.suffix=='.webp' else 'image/png'
  img['src']='data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode()
 return str(s)
results=[]
def ok(label):results.append({'check':label,'result':'PASS'})
# Check every real built URL/fragment without requiring hosted navigation.
for path in (root/'dist').glob('*.html'):
 soup=BeautifulSoup(path.read_text(),'html.parser');ids=[x['id'] for x in soup.find_all(id=True)]
 assert len(ids)==len(set(ids)),f'Duplicate ID {path.name}'
 for el in soup.select('[href],[src]'):
  href=el.get('href',el.get('src',''))
  if not href or href.startswith(('https:','mailto:','data:')):continue
  target,_,fragment=href.partition('#');file=(root/'dist'/target.lstrip('/')) if target else path
  assert file.exists(),f'Missing file {href} on {path.name}'
  if fragment:
   dest=soup if not target else BeautifulSoup(file.read_text(),'html.parser')
   assert dest.find(id=fragment),f'Missing anchor {href} on {path.name}'
ok('Every internal page, asset, anchor and ID in the built site is valid')
with sync_playwright() as pw:
 executable = os.environ.get('CHROMIUM_PATH') or shutil.which('chromium')
 browser=pw.chromium.launch(**({'executable_path':executable} if executable else {}),args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':1000},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.emulate_media(reduced_motion='reduce')
 for slug in ['index','privacy','terms','support','delete-account','cookies','404']:
  for width in [320,360,390,768,1024,1440]:
   page.set_viewport_size({'width':width,'height':844 if width<800 else 1000})
   page.set_content(document(slug))
   dimensions=page.evaluate('({vw:innerWidth,sw:document.documentElement.scrollWidth})')
   assert dimensions['sw']<=dimensions['vw'],(slug,width,dimensions)
   assert page.locator('main h1').count()==1
   if width==390 and slug in ['privacy','delete-account','support']:
    page.screenshot(path=str(root/f'qa/{slug}-mobile.png'),full_page=True)
   if width==1440 and slug=='delete-account':page.screenshot(path=str(root/'qa/delete-account-desktop.png'),full_page=True)
  ok(f'{slug}: no horizontal overflow at 320, 360, 390, 768, 1024 and 1440 pixels')
 assert not errors,errors;ok('No page JavaScript exceptions in the isolated browser renders')
 # Reduced motion, default not falsely interactive.
 page.set_content(document());expect(page.locator('html')).to_have_class('motion-paused')
 assert page.locator('.motion-control').is_disabled();ok('Device reduced motion disables continuous animation and reflects its state')
 page.emulate_media(reduced_motion='no-preference');page.set_content(document())
 page.locator('.motion-control').click();expect(page.locator('html')).to_have_class('motion-paused');page.locator('.motion-control').click();assert 'motion-paused' not in (page.locator('html').get_attribute('class')or'');ok('Manual pause/resume changes the animation state')
 page.set_viewport_size({'width':390,'height':844});page.set_content(document());page.locator('.menu-toggle').click();expect(page.locator('#mobile-nav')).to_be_visible();page.keyboard.press('Escape');expect(page.locator('#mobile-nav')).to_be_hidden();expect(page.locator('.menu-toggle')).to_be_focused();ok('Mobile menu opens, closes with Escape and returns focus')
 page.locator('#tab-practise').focus();page.keyboard.press('ArrowRight');expect(page.locator('#tab-understand')).to_be_focused();expect(page.locator('#panel-understand')).to_be_visible();expect(page.locator('#panel-practise')).to_be_hidden();page.keyboard.press('End');expect(page.locator('#panel-progress')).to_be_visible();ok('Feature tabs support keyboard selection and visible panel changes')
 page.locator('.faq-item summary').first.click();assert page.locator('.faq-item').first.get_attribute('open') is not None;ok('FAQs open with native disclosure semantics')
 for slug,button in [('support','#support-submit'),('delete-account','#delete-email-form button')]:
  page.set_content(document(slug));assert page.locator(button).is_disabled();assert 'unavailable' in page.locator('.form-status').inner_text();ok(f'{slug}: missing live settings disable submission rather than simulate success')
 # DOM-only no-JavaScript render, not a claim of hosted browser network coverage.
 page.set_content(document('index',javascript=False));assert 'CA$14.99' in page.inner_text('body');assert page.locator('main h1').is_visible();ok('Landing and pricing remain readable without JavaScript')
 # Inject explicit synthetic services into isolated DOM tests. No real provider receives data.
 def mock_document(slug,scenario='success'):
  html=document(slug)
  setup='''<script>window.__calls=[];window.__scenario=SCENARIO;window.turnstile={render(node,o){this.callback=o.callback;o.callback('synthetic-captcha');return 'widget-1'},reset(){if(this.callback)this.callback('synthetic-captcha')}};window.fetch=async(path,options)=>{const b=JSON.parse(options.body);window.__calls.push({path,body:b,headers:options.headers});let data={},status=200;if(path==='/api/support'){data=window.__scenario==='fail'?{message:'Support service is unavailable.'}:{accepted:true};if(window.__scenario==='fail')status=503;}else if(b.action==='send-code')data={sent:true};else if(b.action==='verify-code')data={verified:true,accessToken:'synthetic_browser_token'};else if(b.action==='signout')data={signedOut:true};else if(b.action==='delete'){if(window.__scenario==='fail'){data={message:'Deletion was not confirmed.'};status=503;}else data={deleted:true};}return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}})};</script>'''.replace('SCENARIO',json.dumps(scenario))
  html=html.replace('"formsEnabled":false','"formsEnabled":true')
  return html.replace('</head>',setup+'</head>')
 for scenario in ['success','fail']:
  page.set_content(mock_document('support',scenario));page.locator('#support-email').fill('learner@local.invalid');page.locator('#support-topic').select_option('account');page.locator('#support-message').fill('This is a synthetic browser test message.');page.locator('#support-submit').click()
  expect(page.locator('#support-status')).to_contain_text('accepted for delivery' if scenario=='success' else 'unavailable');ok(f'Support {scenario} UI requires its corresponding API response (synthetic provider)')
 def verify():
  page.locator('#delete-email').fill('learner@local.invalid');page.locator('#delete-email-form button').click();expect(page.locator('#delete-code-panel')).to_be_visible();page.locator('#delete-code').fill('123456');page.locator('#delete-code-form button').click();expect(page.locator('#delete-confirm-panel')).to_be_visible()
 for scenario in ['success','fail']:
  page.set_content(mock_document('delete-account',scenario));verify()
  assert not any(x['body'].get('action')=='delete'for x in page.evaluate('window.__calls'));ok(f'OTP alone does not delete an account ({scenario} fixture)')
  page.locator('#delete-ack').check();page.locator('#delete-confirm-text').fill('WRONG');page.locator('#delete-confirm-form button').click();assert not any(x['body'].get('action')=='delete'for x in page.evaluate('window.__calls'))
  page.locator('#delete-confirm-text').fill('DELETE');page.locator('#delete-confirm-form button').click()
  if scenario=='success':expect(page.locator('#delete-success-panel')).to_be_visible();assert page.locator('#delete-email').input_value()==''
  else:expect(page.locator('#delete-status')).to_contain_text('not confirmed');expect(page.locator('#delete-success-panel')).to_be_hidden()
  ok(f'Deletion {scenario} path enforces explicit confirmation and truthful result (synthetic provider)')
 page.set_content(mock_document('delete-account'));verify();page.locator('#delete-cancel').click();expect(page.locator('#delete-email-panel')).to_be_visible();assert not any(x['body'].get('action')=='delete'for x in page.evaluate('window.__calls'));assert any(x['body'].get('action')=='signout'for x in page.evaluate('window.__calls'));ok('Cancel requests local sign-out and never invokes deletion (synthetic provider)')
 browser.close()
(root/'qa/browser-checks.json').write_text(json.dumps({'method':'Isolated Chromium DOM rendering via set_content; local network navigation is policy-blocked. No deployed-site, live CAPTCHA, email or real deletion tests are claimed.','checks':results},indent=2))
print(f'{len(results)} browser/static validation groups passed.')
