const timeline = gsap.timeline({
  defaults: {
    ease: "power1.out",
  },
});

timeline.to(".text", { y: "0%", duration: 1, stagger: 0.3 });
timeline.to(".slider", { y: "-100%", duration: 1.5, delay: 1 });
timeline.to(".intro", { y: "-100%", duration: 1 }, "-=1");
