package work.onss.aop;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.AsyncHandlerInterceptor;
import work.onss.domain.QResourceCustomer;
import work.onss.domain.QResource;
import work.onss.domain.QStore;
import work.onss.domain.StoreRepository;
import work.onss.exception.ServiceException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.lang.reflect.Method;
import java.util.Arrays;

import static work.onss.domain.QResource.resource;

@Log4j2
@Component
@Order(value = 2)
public class RequestMappingInterceptor implements AsyncHandlerInterceptor {

    @Autowired
    private JPAQueryFactory jpaueryFactory;
    @Autowired
    private StoreRepository storeRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws ServiceException {
        String contextPath = request.getContextPath();
        if (handler instanceof HandlerMethod) {
            Method method = ((HandlerMethod) handler).getMethod();
            Long cid = Long.valueOf(request.getHeader("cid"));
            Long sid = Long.valueOf(request.getHeader("sid"));
            if (StringUtils.hasLength(String.valueOf(cid)) && StringUtils.hasLength(String.valueOf(sid))) {
                String value = null;
                String type = null;
                GetMapping getMapping = method.getDeclaredAnnotation(GetMapping.class);
                if (getMapping != null) {
                    value = Arrays.toString(getMapping.value());
                    type = RequestMethod.GET.name();
                }
                PostMapping postMapping = method.getDeclaredAnnotation(PostMapping.class);
                if (value == null && postMapping != null) {
                    value = Arrays.toString(postMapping.value());
                    type = RequestMethod.POST.name();
                }
                PutMapping putMapping = method.getDeclaredAnnotation(PutMapping.class);
                if (value == null && putMapping != null) {
                    value = Arrays.toString(putMapping.value());
                    type = RequestMethod.PUT.name();
                }
                DeleteMapping deleteMapping = method.getDeclaredAnnotation(DeleteMapping.class);
                if (value == null && deleteMapping != null) {
                    value = Arrays.toString(deleteMapping.value());
                    type = RequestMethod.DELETE.name();
                }
                PatchMapping patchMapping = method.getDeclaredAnnotation(PatchMapping.class);
                if (value == null && patchMapping != null) {
                    value = Arrays.toString(patchMapping.value());
                    type = RequestMethod.PATCH.name();
                }
                QStore qStore = QStore.store;
                BooleanExpression booleanExpression = qStore.id.eq(sid).and(qStore.customerId.eq(cid));
                boolean exists = storeRepository.exists(booleanExpression);
                if (exists) {
                    return true;
                } else {
                    QResource qResource = resource;
                    QResourceCustomer qResourceCustomer = QResourceCustomer.resourceCustomer;
                    Long id = jpaueryFactory.select(qResource.id).from(qResource)
                            .innerJoin(qResourceCustomer).on(qResourceCustomer.resourceId.eq(qResource.id))
                            .where(
                                    qResourceCustomer.storeId.eq(sid),
                                    qResourceCustomer.customerId.eq(cid),
                                    qResource.value.eq(value),
                                    qResource.type.eq(type),
                                    qResource.contextPath.eq(contextPath)
                            ).fetchOne();
                    if (id == null) {
                        throw new ServiceException("FAIL", "权限不足");
                    } else {
                        return true;
                    }
                }
            }
        }
        return true;
    }
}
