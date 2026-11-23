import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="nf">
      <img src="/video/stills/stroitelstvo-0.jpg" alt="" />
      <div className="nf-shade" />
      <div className="nf-txt">
        <span className="nf-num">404</span>
        <h1>Тук още няма нищо построено</h1>
        <p className="lead">Страницата, която търсиш, не съществува или е преместена.</p>
        <div className="row center">
          <Link className="btn sm" href="/">Към началото</Link>
          <Link className="btn ghost" href="/#sections">Виж секциите</Link>
        </div>
      </div>
    </section>
  );
}
